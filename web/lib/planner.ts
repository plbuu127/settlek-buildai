import {residenceGuides} from "../data/residence-guides.ts";
import { documentCatalog } from '../data/catalog.ts';

export type Locale = 'ko' | 'en';
export type Text = { ko: string; en: string };
export type Profile = {
  status: string;
  visa: string;
  expiry: string;
  goal: string;
  city: string;
  events: string[];
  answers: Record<string, string>;
  note: string;
};
export type Question = {
  id: string;
  label: Text;
  why: Text;
  type?: 'date';
  options?: { value: string; label: Text }[];
};
export type Task = { id: string; title: Text; body: Text; sourceIds: string[] };
export type Document = {
  id: string;
  title: Text;
  why: Text;
  where: Text;
  steps: Text[];
  request?: Text;
  sourceIds: string[];
  classification: 'official' | 'conditional' | 'check';
  context: string;
};
export type Plan = {
  tasks: Task[];
  documents: Document[];
  questions: Question[];
  fingerprint: string;
};
export type Prep = {
  state: 'todo' | 'doing' | 'done';
  held: boolean;
  reuse: boolean;
  context: string;
  checkedAt?: string;
};

const t = (ko: string, en: string): Text => ({ ko, en });
const option = (value: string, ko: string, en: string) => ({ value, label: t(ko, en) });
const value = (input: string | undefined): string => {
  const normalized = (input ?? '').trim().toLowerCase();
  return ['unknown', 'unsure', 'not-sure', '모름', '잘 모르겠어요'].includes(normalized)
    ? 'unknown'
    : normalized;
};
const has = (input: string | undefined) => value(input) !== '';

export function blankProfile(): Profile {
  return { status: '', visa: '', expiry: '', goal: '', city: '', events: [], answers: {}, note: '' };
}

function conditions(profile: Profile) {
  const status = value(profile.status);
  const goal = value(profile.goal);
  const events = new Set(profile.events.map(value));
  const visa = value(profile.visa).replace(/[\s–—]/g, '').toUpperCase();
  const permanent = /^F-?5(?:$|[^0-9])/.test(visa);
  const worker = ['worker', 'working', 'employed'].includes(status);
  const student = ['student', 'studying'].includes(status);
  const jobseeker = ['jobseeker', 'job-seeker', 'searching'].includes(status);
  const address = events.has('moved');
  const extensionIntent = goal === 'stay' || events.has('extension');
  const extension = extensionIntent && !permanent;
  const work = goal === 'work' || events.has('employed') || events.has('searching') || (extension && (worker || jobseeker));
  const education = goal === 'study' || events.has('education') || events.has('graduation') || (extension && student);
  const integration = goal === 'integration' || events.has('integration');
  const employmentAnswer = value(profile.answers.employment);
  const employment = employmentAnswer || (events.has('searching') || jobseeker
    ? 'searching' : events.has('employed') || worker ? 'working' : '');
  const study = value(profile.answers.study) || (events.has('graduation')
    ? 'graduated' : student ? 'enrolled' : '');
  const housing = value(profile.answers.housing);
  const integrationState = value(profile.answers.integration);
  const addressReported = value(profile.answers.addressReported);
  const housingRelevant = extension || (address && addressReported !== 'yes') || work || education;
  return {
    status, goal, events, visa, permanent, address, extensionIntent, extension,
    work, education, integration, employment, study, housing, integrationState,
    addressReported, housingRelevant,
  };
}

export function questionsFor(profile: Profile): Question[] {
  const c = conditions(profile);
  const questions: Question[] = [];
  if (c.address && !has(profile.answers.addressReported)) {
    questions.push({
      id: 'addressReported',
      label: t('이사 후 체류지 변경 신고를 했나요?', 'Have you reported your new address?'),
      why: t('이미 신고했다면 신고 내역을 확인하는 단계로 바뀝니다.', 'An existing report changes the next step to checking its record.'),
      options: [option('no', '아직 안 했어요', 'Not yet'), option('yes', '신고했어요', 'Yes'), option('unknown', '잘 모르겠어요', 'Not sure')],
    });
  }
  if (c.housingRelevant && !has(profile.answers.housing)) {
    questions.push({
      id: 'housing',
      label: t('현재 거주지는 어떻게 마련했나요?', 'What is your current housing arrangement?'),
      why: t('본인 계약인지 숙소 제공인지에 따라 거주 증빙 후보가 달라집니다.', 'The residence evidence candidates differ for your own lease and provided housing.'),
      options: [option('lease', '내 이름으로 임대차 계약', 'Lease in my name'), option('provided', '가족·지인·회사·학교가 제공', 'Provided by family, a host, employer, or school'), option('unknown', '아직 모르겠어요', 'Not sure yet')],
    });
  }
  if (c.work && !c.employment) {
    questions.push({
      id: 'employment',
      label: t('현재 취업 상황은 어떤가요?', 'What is your current employment situation?'),
      why: t('구직 중인지, 제안을 받았는지, 근무 중인지에 따라 확인할 자료가 달라집니다.', 'Searching, an offer, and current employment lead to different document candidates.'),
      options: [option('searching', '구직 중', 'Looking for work'), option('offer', '채용 제안을 받음', 'Have an offer'), option('working', '근무 중', 'Currently working'), option('unknown', '아직 정해지지 않음', 'Not decided yet')],
    });
  }
  if (c.education && !c.study) {
    questions.push({
      id: 'study',
      label: t('현재 학업 상황은 어떤가요?', 'What is your current study situation?'),
      why: t('입학·재학·졸업 상황에 맞는 증빙 후보만 보여드립니다.', 'This narrows the candidates to admission, current study, or graduation.'),
      options: [option('admitted', '입학 예정', 'Admitted / starting soon'), option('enrolled', '재학 중', 'Currently enrolled'), option('graduated', '졸업함', 'Graduated'), option('unknown', '아직 모르겠어요', 'Not sure yet')],
    });
  }
  if (c.integration && !has(profile.answers.integration)) {
    questions.push({
      id: 'integration',
      label: t('사회통합프로그램 참여 상황은 어떤가요?', 'What is your KIIP participation status?'),
      why: t('참여 전에는 모집·평가 절차를, 참여 이후에는 본인 기록을 확인합니다.', 'Before joining, check registration and assessment; after joining, review your own record.'),
      options: [option('interested', '참여를 알아보는 중', 'Exploring participation'), option('registered', '신청했거나 참여 중', 'Registered / participating'), option('completed', '이수함', 'Completed'), option('unknown', '잘 모르겠어요', 'Not sure')],
    });
  }
  if (c.events.has('extension') && !c.permanent && !has(profile.expiry) && !has(profile.answers.expiry)) {
    questions.push({
      id: 'expiry', type: 'date',
      label: t('등록증 등에 표시된 체류기간 만료일은 언제인가요?', 'What expiry date is shown on your residence record?'),
      why: t('공식 기록과 상담 시 확인할 날짜입니다. 이 날짜로 법정 신고 기한을 자동 계산하지 않습니다.', 'Use the date when checking your official record or asking for advice. No legal deadline is calculated from it.'),
    });
  }
  return questions;
}

function stableContext(id: string, fields: Record<string, string | boolean | string[]>) {
  return JSON.stringify({ version: 1, id, ...fields });
}

export function buildPlan(profile: Profile): Plan {
  const c = conditions(profile);
  const tasks: Task[] = [];
  const documents = new Map<string, Document>();
  const checks = new Set<string>();
  const visaKnown = c.visa !== '' && c.visa !== 'UNKNOWN';
  const task = (id: string, title: Text, body: Text, sourceIds: string[]) => tasks.push({ id, title, body, sourceIds });
  const contextFor = (id: string) => {
    if (['lease', 'accommodation', 'residenceProviderID'].includes(id)) {
      return stableContext(id, { housing: c.housing, city: value(profile.city), moved: c.address, moveDate: value(profile.answers.moveDate) });
    }
    if (['employmentContract', 'employerRegistration', 'employmentProof', 'income', 'jobSearchPlan'].includes(id)) {
      return stableContext(id, { employment: c.employment, visa: c.visa });
    }
    if (['enrollment', 'tuition', 'graduation'].includes(id)) {
      return stableContext(id, { study: c.study });
    }
    if (id === 'balance') return stableContext(id, { study: c.study, visa: c.visa });
    if (id === 'application') return stableContext(id, { visa: c.visa, extension: c.extension, address: c.address && c.addressReported !== 'yes' });
    if (id === 'residenceCard') return stableContext(id, { visa: c.visa });
    if (id === 'kiip') return stableContext(id, { integration: c.integrationState });
    if (id === 'consultationChecklist') return stableContext(id, { visa: c.visa, checks: [...checks].sort() });
    return stableContext(id, {});
  };
  const add = (id: string, why?: Text, classification?: Document['classification']) => {
    const source = documentCatalog[id];
    if (!source) throw new Error(`Missing document catalog entry: ${id}`);
    const prior = documents.get(id);
    documents.set(id, {
      ...source,
      id,
      why: why ?? prior?.why ?? source.why,
      classification: classification ?? prior?.classification ?? source.classification,
      sourceIds: [...source.sourceIds],
      steps: source.steps.map((step) => ({ ...step })),
      context: contextFor(id),
    });
  };

  if (!visaKnown) checks.add('visa');
  if (!c.goal || c.goal === 'unknown') checks.add('goal');

  if (c.address) {
    if (c.addressReported === 'yes') {
      task('address', t('체류지 신고 내역 확인', 'Check your address report'), t('신고 접수·처리 내역과 현재 주소가 맞는지 확인하세요. 추가 조치가 필요한지는 공식 안내에서 확인합니다.', 'Check the receipt or processed record and whether it shows your current address. Confirm any further action through official guidance.'), ['gov24-address', '1345']);
    } else {
      task('address', t('체류지 변경 신고 절차 확인', 'Check the address-change procedure'), t('새 거주지의 신고 방법과 적용 기한을 정부24 또는 1345에서 확인하세요. 신분 증빙은 여권 또는 외국인등록증 중 해당하는 자료, 거주 증빙은 본인 상황에 맞는 대안을 확인합니다.', 'Confirm the reporting method and applicable deadline with Government24 or 1345. Check the applicable identity alternative (passport or residence card) and residence evidence for your housing arrangement.'), ['gov24-address', '1345']);
      const noCard = ['visitor', 'newcomer', 'arriving', 'pre-arrival'].includes(c.status);
      add(noCard ? 'passport' : 'residenceCard', t('체류지 신고의 신분 증빙 대안입니다. 여권과 등록증을 모두 필수로 표시한 것이 아닙니다.', 'An identity-evidence alternative for the address report. This does not make both a passport and a residence card mandatory.'), 'official');
      if (c.addressReported === 'unknown' || !c.addressReported) checks.add('address-report');
    }
  }

  if (c.extension) {
    task('extension', t('체류기간과 연장 절차 확인', 'Check your stay period and extension procedure'), t('공식 기록의 만료일과 세부 체류자격에 맞는 연장 안내를 확인하세요. 아래 공통 서류 외에 추가 자료가 있을 수 있으며, 이 목록은 연장 가능 여부나 접수 기한을 판단하지 않습니다.', 'Check the expiry in your official record and the extension guidance for your exact status. Additional documents may apply beyond the common items below. This plan does not determine eligibility or a filing deadline.'), ['stay-extension', 'hikorea-manual', '1345']);
    for (const id of ['application', 'passport', 'residenceCard']) add(id);
    checks.add('extension-subtype');
  } else if (c.extensionIntent && c.permanent) {
    task('stay-check', t('영주 체류·등록증 관련 절차 확인', 'Check permanent-residence and card procedures'), t('F-5는 일반 체류기간 연장 목록으로 처리하지 않습니다. 등록증 유효기간·재발급 또는 현재 필요한 민원은 공식 안내나 1345에서 구분해 확인하세요.', 'F-5 is not handled with the ordinary stay-extension checklist. Use official guidance or 1345 to distinguish card validity, reissue, and the service you actually need.'), ['hikorea-manual', '1345']);
    checks.add('permanent-residence-service');
  }

  if (c.housingRelevant) {
    if (c.housing === 'lease') add('lease', t('본인 명의 임대차 계약에 해당하는 거주 증빙 후보입니다. 현재 주소와 제출처의 인정 조건을 확인하세요.', 'Residence evidence candidate for a lease in your name. Check the current address and the receiving office’s acceptance conditions.'));
    else if (c.housing === 'provided') add('accommodation', t('가족·지인·회사·학교가 제공한 거주지에 맞는 증빙 대안입니다. 제공자 관련 추가 자료는 제출처에 확인하세요.', 'A residence-evidence alternative for housing provided by a host, family, employer, or school. Ask the receiving office about any additional provider documents.'));
    else checks.add('housing');
  }

  if (c.work && ['F-2','F-6'].includes(c.visa)) {
    const guide = residenceGuides[c.visa];
    task('work', guide.title, guide.summary, guide.sourceIds);
    checks.add('residence-work-condition');
  } else if (c.work) {
    task('work', t('취업 상황에 맞는 체류 절차 확인', 'Check the procedure for your work situation'), t('구직·채용 제안·현재 근무 상황과 세부 체류자격을 함께 확인하세요. 근무 가능 여부, 허가·신고 대상, 아래 후보 서류의 필요 여부는 하이코리아 또는 1345에서 확인해야 합니다.', 'Check your job-search, offer, or current-work situation together with your exact status. Confirm work permission, any approval or reporting requirement, and whether the candidate documents below apply with HiKorea or 1345.'), ['hikorea-manual', '1345']);
    if (c.employment === 'offer') {
      add('employmentContract', t('채용 제안 내용을 상담할 때 검토할 후보 자료입니다. 모든 취업 절차의 공통 필수 서류는 아닙니다.', 'A candidate for discussing the job offer. It is not a universal requirement for every employment procedure.'), 'conditional');
      add('employerRegistration', t('제안한 고용주의 정보를 확인할 때 필요한지 문의할 후보입니다.', 'A candidate to ask about when confirming the prospective employer’s details.'), 'check');
    } else if (c.employment === 'working') {
      add('employmentContract', t('현재 근무 조건과 체류자격 관련 절차를 상담할 때 검토할 후보입니다.', 'A candidate for discussing current work conditions and the procedure for your status.'), 'conditional');
      add('employmentProof', t('현재 근무 사실을 설명할 자료가 필요한지 확인하는 후보입니다.', 'A candidate to check if evidence of current employment is requested.'), 'check');
    } else if (c.employment === 'searching') {
      add('jobSearchPlan', t('구직 관련 체류 절차에 해당하는지 상담 후 필요 여부를 확인할 후보입니다. 구직 체류자격이 가능하다는 뜻은 아닙니다.', 'A candidate to check after confirming whether a job-search procedure applies. It does not establish eligibility for a job-search status.'), 'check');
    } else checks.add('employment');
    checks.add('work-permission-and-subtype');
  }

  if (c.education) {
    task('education', t('학업 상황과 체류 서류 확인', 'Check study-related documents'), t('학교 담당자와 세부 체류자격별 최신 안내를 함께 확인하세요. Study in Korea의 과거 안내에서 언급된 자료는 상담 후보이며, 현재의 공통 필수 목록으로 볼 수 없습니다.', 'Check with your school and current guidance for your exact status. Items mentioned in historical Study in Korea guidance are candidates for consultation, not a current universal requirement list.'), ['studyinkorea', 'hikorea-manual', '1345']);
    if (c.study === 'enrolled' || c.study === 'admitted') {
      add('enrollment', t('입학·재학 상황을 설명할 학교 증빙 후보입니다. 현재 절차에서 인정하는 증명서 종류를 학교와 제출처에 확인하세요.', 'A school-evidence candidate for admission or enrollment. Ask your school and the receiving office which certificate is accepted for the current procedure.'), 'conditional');
      add('balance', t('과거 유학 안내에서 언급된 재정 증빙 후보입니다. 현재 제출 필요 여부·명의·금액·발급 시점은 별도 확인이 필요합니다.', 'A financial-evidence candidate mentioned in historical study guidance. Confirm current applicability, account holder, amount, and issue-date requirements separately.'), 'check');
    } else if (c.study === 'graduated') {
      add('graduation', t('졸업 후 다음 절차를 상담할 때 검토할 증빙 후보입니다. 제출 필요 여부는 다음 체류 목적에 따라 확인하세요.', 'A candidate for discussing the next procedure after graduation. Confirm whether it is required for your next purpose of stay.'), 'check');
    } else checks.add('study');
    checks.add('education-current-requirements');
  }

  if (c.integration) {
    task('integration', t('사회통합프로그램 참여 단계 확인', 'Check your KIIP participation step'), t('사회통합정보망에서 모집·평가·교육 및 본인 참여 기록을 확인하세요. 프로그램 참여나 이수만으로 영주·귀화 자격이 결정되지는 않으며, 관련 요건은 별도 공식 상담이 필요합니다.', 'Use Socinet to check recruitment, assessment, classes, and your participation record. Participation or completion alone does not determine permanent-residence or naturalization eligibility; confirm those requirements separately.'), ['socinet', 'kiip-info', 'nationality', '1345']);
    if (['registered', 'completed'].includes(c.integrationState)) {
      add('kiip', t('참여·이수 기록을 본인이 확인할 때 쓸 수 있는 선택 자료입니다. 특정 신청에 제출해야 하는지는 별도 확인하세요.', 'An optional record for reviewing your participation or completion. Check separately whether a particular application requires it.'), 'conditional');
    } else if (c.integrationState !== 'interested') checks.add('integration');
  }

  if (!tasks.length) {
    task('check-route', t('다음 절차부터 함께 확인', 'Identify the next procedure'), t('현재 체류자격과 하고 싶은 일을 정리한 뒤, 공식 안내 또는 1345에서 해당 절차를 확인하세요. 모르는 항목은 모르는 상태로 상담할 수 있습니다.', 'Summarize your current status and what you want to do, then identify the applicable procedure through official guidance or 1345. You can ask for advice with some details still unknown.'), ['hikorea-manual', '1345']);
    checks.add('next-procedure');
  }
  if (checks.size) {
    add('consultationChecklist', t('아직 모르는 조건과 세부 체류자격별 요건을 공식 창구에 확인하기 위한 메모입니다. 서류 목록을 확정하기 전에 답변을 확인하세요.', 'Notes for checking unknown conditions and requirements for your exact status with an official source. Confirm the answers before treating the document list as final.'), 'check');
  }
  const questions = questionsFor(profile);
  const result = [...documents.values()];
  // This fingerprint describes the actual plan; unrelated notes do not change it.
  const serialized = JSON.stringify({ tasks, documents: result.map(({ id, context, why, classification }) => ({ id, context, why, classification })), questions });
  let hash = 2166136261;
  for (let i = 0; i < serialized.length; i++) hash = Math.imul(hash ^ serialized.charCodeAt(i), 16777619);
  return { tasks, documents: result, questions, fingerprint: (hash >>> 0).toString(36) };
}

export function reconcilePreparation(previous: Record<string, Prep>, next: Plan): Record<string, Prep> {
  const reconciled: Record<string, Prep> = {};
  for (const document of next.documents) {
    const old = previous[document.id];
    if (old?.context === document.context) {
      reconciled[document.id] = { ...old };
    } else {
      reconciled[document.id] = {
        state: 'todo',
        held: old?.held ?? false,
        reuse: false,
        context: document.context,
      };
    }
  }
  return reconciled;
}
