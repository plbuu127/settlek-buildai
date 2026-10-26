import {additionalSources} from "./residence-guides.ts";
import type {Document} from "../lib/planner.ts";
export const sources=[
  ...additionalSources,
  {
    "id": "gov24-address",
    "title": {
      "ko": "정부24 · 외국인 체류지변경신고",
      "en": "Government24 · Change of residence"
    },
    "agency": "Government24",
    "url": "https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=12700000026",
    "scope": {
      "ko": "등록외국인의 체류지 변경. 신분확인 서류와 거주 입증자료의 예시. 거주 입증자료는 선택 가능한 대안이며 모두 필요한 것은 아닙니다.",
      "en": "Address changes by registered foreign residents. Residence evidence examples are alternatives, not a requirement to collect them all."
    },
    "topics": [
      "moved"
    ],
    "checked": "2026-10-26"
  },
  {
    "id": "stay-extension",
    "title": {
      "ko": "하이코리아 · 등록외국인 체류기간 연장",
      "en": "HiKorea · Extension of stay"
    },
    "agency": "HiKorea",
    "url": "https://www.hikorea.go.kr/cvlappl/cvlapplInfoR.pt?CAT_SEQ=1808",
    "scope": {
      "ko": "공통 준비자료와 체류자격별 추가자료 확인. 전자민원 가능 대상과 예외는 별도 확인. 영주(F-5)는 체류기간 연장 대상이 아닙니다.",
      "en": "Common preparation and status-specific additions. Online filing availability varies. F-5 permanent residents do not need period-of-stay extensions."
    },
    "topics": [
      "extension",
      "stay"
    ],
    "checked": "2026-10-26"
  },
  {
    "id": "hikorea-manual",
    "title": {
      "ko": "하이코리아 · 체류자격별 안내 매뉴얼",
      "en": "HiKorea · Status-specific manuals"
    },
    "agency": "HiKorea",
    "url": "https://www.hikorea.go.kr/board/BoardNtcDetailR.pt?BBS_GB_CD=BS10&BBS_SEQ=1&NTCCTT_SEQ=1062&page=1",
    "scope": {
      "ko": "게시된 매뉴얼은 2026-10-19 기준. 게시가 최신 지침보다 늦을 수 있어 개별 조건은 1345나 관할 기관에 확인하세요. 첨부문서의 모든 조건을 검증한 것은 아닙니다.",
      "en": "Manuals listed as of 2026-10-19. Publications may lag current instructions. Confirm case-specific requirements with 1345 or your immigration office; every attachment condition has not been verified."
    },
    "topics": [
      "work",
      "study",
      "stay",
      "extension"
    ],
    "checked": "2026-10-26"
  },
  {
    "id": "hikorea-forms",
    "title": {
      "ko": "법무부 · 통합신청서 안내",
      "en": "Ministry of Justice · Integrated application form"
    },
    "agency": "Ministry of Justice",
    "url": "https://www.immigration.go.kr/bbs/immigration/212/561864/artclView.do",
    "scope": {
      "ko": "신청서 종류와 이용 절차 설명. 2022년 안내이므로 제출용 양식은 하이코리아 민원서식에서 최신본을 받으세요.",
      "en": "Explains integrated forms. This 2022 notice is background; obtain the current form from HiKorea before filing."
    },
    "topics": [
      "moved",
      "extension",
      "work"
    ],
    "checked": "2026-10-26"
  },
  {
    "id": "studyinkorea",
    "title": {
      "ko": "Study in Korea · 체류 및 생활 안내",
      "en": "Study in Korea · Residence and stay"
    },
    "agency": "NIIED",
    "url": "https://www.studyinkorea.go.kr/ko/life/residenceAndStayInfo.do",
    "scope": {
      "ko": "유학생 체류·시간제취업 안내. 학생 시간제취업 서류를 모든 외국인 근로자에게 적용하지 않습니다.",
      "en": "Student residence and part-time work. Student employment documents do not automatically apply to all foreign workers."
    },
    "topics": [
      "study",
      "education",
      "graduation",
      "work"
    ],
    "checked": "2026-10-26"
  },
  {
    "id": "student-reference",
    "title": {
      "ko": "외국인 유학생 가이드북 (2021 참고자료)",
      "en": "International Student Guidebook (2021 reference)"
    },
    "agency": "NIIED",
    "url": "https://www.studyinkorea.go.kr/public/res/guide/guideBook_ko.pdf",
    "scope": {
      "ko": "재학·재정 자료의 종류를 이해하기 위한 과거 참고자료입니다. 현재의 필수 목록·금액·예외로 확정하지 않습니다.",
      "en": "Historical reference for enrollment and financial evidence types. Not a verified current checklist, threshold or exemption."
    },
    "topics": [
      "study",
      "education"
    ],
    "checked": "2026-10-26"
  },
  {
    "id": "kiip-info",
    "title": {
      "ko": "법무부 · 사회통합프로그램",
      "en": "Ministry of Justice · Social Integration Program"
    },
    "agency": "Ministry of Justice",
    "url": "https://www.immigration.go.kr/immigration/1571/subview.do",
    "scope": {
      "ko": "참여 대상과 과정 안내. 이수 자체가 귀화 허가나 자격 확정을 뜻하지 않습니다.",
      "en": "Program eligibility and courses. Completion is not nationality approval or a final eligibility decision."
    },
    "topics": [
      "integration"
    ],
    "checked": "2026-10-26"
  },
  {
    "id": "socinet",
    "title": {
      "ko": "사회통합정보망 · 과정과 평가",
      "en": "Socinet · Courses and assessments"
    },
    "agency": "Ministry of Justice",
    "url": "https://www.socinet.go.kr/soci/main/main.jsp?MENU_TYPE=S_TOP_SY",
    "scope": {
      "ko": "실제 모집·교육·평가 일정과 개인 이수 기록은 사이트에서 확인하세요.",
      "en": "Check current course and assessment dates and your personal participation records on the official site."
    },
    "topics": [
      "integration"
    ],
    "checked": "2026-10-26"
  },
  {
    "id": "1345",
    "title": {
      "ko": "외국인종합안내센터 1345",
      "en": "Immigration Contact Center 1345"
    },
    "agency": "Ministry of Justice",
    "url": "https://www.immigration.go.kr/immigration/1530/subview.do",
    "scope": {
      "ko": "체류·취업·생활 관련 다국어 상담. 정확한 체류자격과 개별 조건을 확인할 공식 경로입니다.",
      "en": "Multilingual immigration and living guidance. Confirm the exact status code and individual circumstances."
    },
    "topics": [
      "work",
      "stay",
      "study",
      "integration",
      "moved"
    ],
    "checked": "2026-10-26"
  },
  {
    "id": "nationality",
    "title": {
      "ko": "귀화 준비 · 공식 상담 경로",
      "en": "Nationality preparation · Official consultation"
    },
    "agency": "Ministry of Justice",
    "url": "https://www.immigration.go.kr/immigration/1530/subview.do",
    "scope": {
      "ko": "귀화 유형과 개별 필요자료는 공식 상담으로 확인합니다. 앱은 자격이나 최종 서류 목록을 판정하지 않습니다.",
      "en": "Confirm the nationality route and documents through official consultation. This app does not determine eligibility or a final checklist."
    },
    "topics": [
      "integration"
    ],
    "checked": "2026-10-26"
  },
  {
    "id": "gov24-facts",
    "title": {
      "ko": "출입국관리법 · 체류지 변경",
      "en": "Immigration Act · Residence reporting"
    },
    "agency": "National Law Information Center",
    "url": "https://www.law.go.kr/법령/출입국관리법/제36조",
    "scope": {
      "ko": "등록외국인 체류지 변경 규정. 다른 신고 제도에 자동 적용하지 않으며 앱에서 법정 마지막 날을 계산하지 않습니다.",
      "en": "Registered-foreigner residence reporting. Not automatically applicable to other reporting systems; the app does not calculate the legal final day."
    },
    "topics": [
      "moved"
    ],
    "checked": "2026-10-26"
  }
];
export const documentCatalog:Record<string,Omit<Document,"context"|"id">>={
  "passport": {
    "title": {
      "ko": "여권 (신분확인 자료)",
      "en": "Passport (identity evidence)"
    },
    "why": {
      "ko": "신분확인에 쓰이는 자료입니다. 주소 변경의 본인 방문 안내는 여권 또는 외국인등록증을 제시합니다.",
      "en": "Identity evidence. For an in-person address change, official guidance lists a passport OR residence card."
    },
    "where": {
      "ko": "현재 보유한 여권",
      "en": "Your existing passport"
    },
    "steps": [
      {
        "ko": "유효기간과 현재 상태를 직접 확인하세요. 앱에 번호나 사본을 올리지 마세요.",
        "en": "Check validity yourself. Do not upload the number or a copy."
      }
    ],
    "sourceIds": [
      "gov24-address",
      "stay-extension"
    ],
    "classification": "official"
  },
  "residenceCard": {
    "title": {
      "ko": "외국인등록증",
      "en": "Residence card"
    },
    "why": {
      "ko": "등록 체류와 관련한 본인 확인 자료입니다. 절차별로 여권과의 대체 가능 여부를 확인하세요.",
      "en": "Evidence of registered residence. Check whether a passport may be used instead for the procedure."
    },
    "where": {
      "ko": "현재 보유한 등록증",
      "en": "Your existing card"
    },
    "steps": [
      {
        "ko": "분실·유효기간·주소 기재를 확인하고 필요한 경우 기관에 문의하세요.",
        "en": "Check loss, validity and address details; ask the office if needed."
      }
    ],
    "sourceIds": [
      "gov24-address",
      "stay-extension"
    ],
    "classification": "official"
  },
  "application": {
    "title": {
      "ko": "통합신청서(신고서)",
      "en": "Integrated application / report"
    },
    "why": {
      "ko": "선택한 신청·신고 절차에 맞는 양식이 필요할 수 있습니다.",
      "en": "The correct form may be needed for your application or report."
    },
    "where": {
      "ko": "하이코리아 민원서식 또는 출입국기관",
      "en": "HiKorea forms or an immigration office"
    },
    "steps": [
      {
        "ko": "공식 안내에서 현재 양식을 받으세요.",
        "en": "Obtain the current form through official guidance."
      },
      {
        "ko": "해당 절차를 확인해 작성하고 서명 항목을 확인하세요.",
        "en": "Select the correct procedure and check required signatures."
      }
    ],
    "sourceIds": [
      "hikorea-forms"
    ],
    "classification": "official"
  },
  "lease": {
    "title": {
      "ko": "임대차계약서",
      "en": "Lease agreement"
    },
    "why": {
      "ko": "본인 명의 임차 거주를 입증할 수 있는 자료입니다. 다른 거주 입증자료와의 대체 여부를 확인하세요.",
      "en": "An option for proving your rented residence. Confirm whether it is sufficient or another alternative applies."
    },
    "where": {
      "ko": "서명한 계약서 또는 임대인·중개사",
      "en": "Your signed agreement, landlord or agent"
    },
    "steps": [
      {
        "ko": "이름·주소·계약기간이 현재 상황과 맞는지 확인하세요.",
        "en": "Check that the name, address and term match your situation."
      }
    ],
    "sourceIds": [
      "gov24-address"
    ],
    "classification": "official"
  },
  "accommodation": {
    "title": {
      "ko": "숙소제공확인서",
      "en": "Accommodation confirmation"
    },
    "why": {
      "ko": "회사·지인 등에게 숙소를 제공받는 경우 확인할 거주 입증자료입니다.",
      "en": "Residence evidence to check when housing is provided by an employer or another person."
    },
    "where": {
      "ko": "숙소를 제공하는 사람·기관",
      "en": "The person or organization providing housing"
    },
    "steps": [
      {
        "ko": "현재 서식과 필요한 추가 증빙을 기관에 먼저 확인하세요.",
        "en": "Check the current form and any supporting evidence with the office."
      },
      {
        "ko": "숙소 제공자에게 작성과 확인을 요청하세요.",
        "en": "Ask the housing provider to complete and verify it."
      }
    ],
    "sourceIds": [
      "gov24-address"
    ],
    "classification": "conditional",
    "request": {
      "ko": "체류 관련 준비를 위해 숙소제공확인서가 필요한지 확인 중입니다. 작성 가능한 담당자와 준비 방법을 알려주실 수 있나요?",
      "en": "I am checking residence evidence for an immigration procedure. Could you tell me who can help with an accommodation confirmation and how to request it?"
    }
  },
  "residenceProviderID": {
    "title": {
      "ko": "숙소 제공자의 추가 증빙 확인",
      "en": "Check supporting housing-provider evidence"
    },
    "why": {
      "ko": "제공자 신분·주택 관련 증빙은 경우에 따라 달라집니다. 요구를 확인하기 전 수집하지 마세요.",
      "en": "Provider evidence varies. Do not collect it before the office confirms what is required."
    },
    "where": {
      "ko": "관할 기관·숙소 제공자",
      "en": "Immigration office and housing provider"
    },
    "steps": [
      {
        "ko": "필요한 문서명과 개인정보 처리 범위를 확인하세요.",
        "en": "Ask for exact document names and the necessary personal-data scope."
      }
    ],
    "sourceIds": [
      "1345"
    ],
    "classification": "check"
  },
  "enrollment": {
    "title": {
      "ko": "재학증명서·연구생증명서",
      "en": "Enrollment / research-status certificate"
    },
    "why": {
      "ko": "학업 관련 준비를 검토할 때 확인할 후보 자료입니다. 현재 자격별 요건은 학교와 기관에 확인하세요.",
      "en": "A candidate for study-related preparation. Confirm current status-specific requirements with your school and the office."
    },
    "where": {
      "ko": "학교 학사·국제처 또는 학생 포털",
      "en": "School registrar, international office or student portal"
    },
    "steps": [
      {
        "ko": "현재 신청에 필요한 증명 종류와 발급일 기준을 먼저 확인하세요.",
        "en": "Confirm the certificate type and issue-date requirements first."
      },
      {
        "ko": "학교 포털에서 발급하거나 담당 부서에 요청하세요.",
        "en": "Request it through your school portal or office."
      }
    ],
    "sourceIds": [
      "student-reference",
      "hikorea-manual"
    ],
    "classification": "conditional",
    "request": {
      "ko": "현재 체류 관련 준비에 필요한 재학 또는 연구생 증명서의 발급 방법을 알려주세요.",
      "en": "Could you advise how to obtain enrollment or research-status evidence for my current immigration preparation?"
    }
  },
  "balance": {
    "title": {
      "ko": "재정입증 자료 확인",
      "en": "Check financial-support evidence"
    },
    "why": {
      "ko": "학업 관련 절차에서 검토할 후보입니다. 필요한 종류와 금액은 확인 전 확정하지 않습니다.",
      "en": "A candidate for study-related procedures. The required evidence and amount are not determined here."
    },
    "where": {
      "ko": "기관 확인 후 은행·장학 담당 부서",
      "en": "Bank or scholarship office after requirements are confirmed"
    },
    "steps": [
      {
        "ko": "허용되는 자료·기준 금액·발급일을 먼저 공식 확인하세요.",
        "en": "Confirm accepted evidence, any threshold and the issue-date rule first."
      },
      {
        "ko": "확인된 종류만 발급받으세요.",
        "en": "Obtain only the confirmed evidence."
      }
    ],
    "sourceIds": [
      "student-reference",
      "hikorea-manual"
    ],
    "classification": "check"
  },
  "graduation": {
    "title": {
      "ko": "졸업·예정 상태 확인 자료",
      "en": "Graduation / expected-graduation evidence"
    },
    "why": {
      "ko": "학업에서 구직·취업으로 바뀌는 상담에 현재 학업 상태를 설명하는 후보 자료입니다.",
      "en": "A candidate for explaining your study status when discussing a transition to job seeking or work."
    },
    "where": {
      "ko": "학교 학사·국제처",
      "en": "Your school registrar or international office"
    },
    "steps": [
      {
        "ko": "새 체류 절차에서 실제 필요한 증명 종류를 먼저 확인하세요.",
        "en": "First confirm the exact certificate required for the proposed procedure."
      }
    ],
    "sourceIds": [
      "hikorea-manual",
      "1345"
    ],
    "classification": "check"
  },
  "employmentContract": {
    "title": {
      "ko": "고용계약서·표준근로계약서",
      "en": "Employment contract"
    },
    "why": {
      "ko": "제안받은 업무·기간·조건을 공식 상담에서 설명하는 자료입니다. 일반 근로자의 필수 목록으로 확정한 것은 아닙니다.",
      "en": "Helps explain proposed duties, dates and conditions in a consultation. Not a universal mandatory document for every worker."
    },
    "where": {
      "ko": "고용주·인사 담당자",
      "en": "Your employer or HR contact"
    },
    "steps": [
      {
        "ko": "제안 조건 또는 서명본을 요청하세요.",
        "en": "Request proposed terms or a signed copy."
      },
      {
        "ko": "근무 시작 전 체류자격에 맞는 허가·신고 절차를 확인하세요.",
        "en": "Confirm the appropriate permission or reporting procedure before starting work."
      }
    ],
    "sourceIds": [
      "studyinkorea",
      "hikorea-manual",
      "1345"
    ],
    "classification": "conditional",
    "request": {
      "ko": "체류·취업 절차를 확인하려고 합니다. 업무 내용, 근무기간, 조건이 포함된 계약서 또는 제안 조건을 받을 수 있을까요?",
      "en": "I am checking the immigration procedure for this job. Could you provide the contract or proposed terms showing duties, dates and conditions?"
    }
  },
  "employerRegistration": {
    "title": {
      "ko": "사업자등록증 사본 (필요 여부 확인)",
      "en": "Employer business-registration copy (confirm need)"
    },
    "why": {
      "ko": "학생 시간제취업 안내에 포함됩니다. 다른 취업 절차는 필요 여부를 별도로 확인하세요.",
      "en": "Listed in student part-time-work guidance. Confirm applicability separately for other employment routes."
    },
    "where": {
      "ko": "회사 인사·행정 담당자",
      "en": "Employer HR or administration"
    },
    "steps": [
      {
        "ko": "본인 절차에서 필요한지 확인한 뒤 회사에 요청하세요.",
        "en": "Confirm that your procedure requires it before requesting a copy."
      }
    ],
    "sourceIds": [
      "studyinkorea",
      "1345"
    ],
    "classification": "conditional"
  },
  "employmentProof": {
    "title": {
      "ko": "현재 근무 상태 확인 자료",
      "en": "Current employment evidence"
    },
    "why": {
      "ko": "근무 변경·연장 상담에 현재 상태를 설명하기 위한 확인 항목입니다.",
      "en": "A consultation preparation item to explain current work when discussing changes or extensions."
    },
    "where": {
      "ko": "고용주·공식 상담",
      "en": "Your employer and official consultation"
    },
    "steps": [
      {
        "ko": "재직 등 정확히 어떤 자료가 필요한지 확인한 뒤 요청하세요.",
        "en": "Ask which exact evidence is needed before requesting it."
      }
    ],
    "sourceIds": [
      "hikorea-manual",
      "1345"
    ],
    "classification": "check"
  },
  "jobSearchPlan": {
    "title": {
      "ko": "구직 상황·활동 계획 정리",
      "en": "Outline your job-search situation"
    },
    "why": {
      "ko": "구직 체류 상담에 목표·활동·일정을 설명하기 위한 준비입니다. 제출 양식은 공식 확인이 필요합니다.",
      "en": "Prepare goals, activities and dates for job-seeking consultation. Any required filing form needs official confirmation."
    },
    "where": {
      "ko": "직접 정리 후 1345·관할 기관 확인",
      "en": "Prepare an outline, then confirm with 1345 or your office"
    },
    "steps": [
      {
        "ko": "원하는 업무와 현재 구직 상태를 정리하세요.",
        "en": "Describe desired work and your current search."
      },
      {
        "ko": "해당 자격의 현재 신청서·첨부서류를 확인하세요.",
        "en": "Confirm current forms and attachments for your status."
      }
    ],
    "sourceIds": [
      "hikorea-manual",
      "1345"
    ],
    "classification": "check"
  },
  "kiip": {
    "title": {
      "ko": "사회통합프로그램 이수·평가 기록",
      "en": "KIIP course / assessment record"
    },
    "why": {
      "ko": "이미 참여한 과정이 있다면 상담에 활용할 수 있는 기록입니다. 귀화 허가를 뜻하지 않습니다.",
      "en": "An existing participation record may help a consultation. It is not nationality approval."
    },
    "where": {
      "ko": "사회통합정보망의 본인 기록",
      "en": "Your own Socinet account"
    },
    "steps": [
      {
        "ko": "현재 이수·평가 기록을 확인하세요.",
        "en": "Check your existing course and assessment record."
      },
      {
        "ko": "필요한 증명서 이름과 발급 방법은 담당 기관에 확인하세요.",
        "en": "Confirm the required certificate name and issue method with the operator."
      }
    ],
    "sourceIds": [
      "kiip-info",
      "socinet"
    ],
    "classification": "conditional"
  },
  "consultationChecklist": {
    "title": {
      "ko": "공식 상담에서 확인할 내용",
      "en": "Questions for official consultation"
    },
    "why": {
      "ko": "정확한 체류자격·절차·예외가 확인돼야 최종 목록을 정할 수 있습니다.",
      "en": "The exact status, procedure and exceptions must be checked before finalizing the list."
    },
    "where": {
      "ko": "1345 또는 관할 출입국·외국인기관",
      "en": "1345 or your immigration office"
    },
    "steps": [
      {
        "ko": "체류자격, 하려는 일, 관련 날짜와 모르는 조건을 정리하세요.",
        "en": "Prepare your status, intended change, relevant dates and unknown conditions."
      },
      {
        "ko": "최종 서류명·발급일 기준·신청 방법을 확인하고 기록하세요.",
        "en": "Ask for exact documents, issue-date rules and filing method, then record the answer."
      }
    ],
    "sourceIds": [
      "1345"
    ],
    "classification": "check"
  },
  "tuition": {
    "title": {
      "ko": "등록금 납부 증명 확인",
      "en": "Check tuition evidence"
    },
    "why": {
      "ko": "모든 경우에 필요한 자료가 아닙니다. 개별 절차에서 요구하는지 먼저 확인하세요.",
      "en": "Not universally required. First check applicability to your individual procedure."
    },
    "where": {
      "ko": "공식 상담 후 해당 발급 기관",
      "en": "Relevant issuer after official consultation"
    },
    "steps": [
      {
        "ko": "요구가 확인되기 전 발급·수집하지 마세요.",
        "en": "Do not obtain or collect it until the requirement is confirmed."
      }
    ],
    "sourceIds": [
      "1345"
    ],
    "classification": "check"
  },
  "income": {
    "title": {
      "ko": "소득 증빙 필요 여부 확인",
      "en": "Check income-evidence requirements"
    },
    "why": {
      "ko": "모든 경우에 필요한 자료가 아닙니다. 개별 절차에서 요구하는지 먼저 확인하세요.",
      "en": "Not universally required. First check applicability to your individual procedure."
    },
    "where": {
      "ko": "공식 상담 후 해당 발급 기관",
      "en": "Relevant issuer after official consultation"
    },
    "steps": [
      {
        "ko": "요구가 확인되기 전 발급·수집하지 마세요.",
        "en": "Do not obtain or collect it until the requirement is confirmed."
      }
    ],
    "sourceIds": [
      "1345"
    ],
    "classification": "check"
  },
  "criminalRecord": {
    "title": {
      "ko": "범죄경력 증빙 필요 여부 확인",
      "en": "Check background-evidence requirements"
    },
    "why": {
      "ko": "모든 경우에 필요한 자료가 아닙니다. 개별 절차에서 요구하는지 먼저 확인하세요.",
      "en": "Not universally required. First check applicability to your individual procedure."
    },
    "where": {
      "ko": "공식 상담 후 해당 발급 기관",
      "en": "Relevant issuer after official consultation"
    },
    "steps": [
      {
        "ko": "요구가 확인되기 전 발급·수집하지 마세요.",
        "en": "Do not obtain or collect it until the requirement is confirmed."
      }
    ],
    "sourceIds": [
      "1345"
    ],
    "classification": "check"
  }
};
