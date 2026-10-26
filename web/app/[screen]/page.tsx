import {notFound} from "next/navigation";import SettleK from "../settlek";
export default async function Page({params}:{params:Promise<{screen:string}>}){const {screen}=await params;if(!["planner","questions","plan","documents","records","sources","reminders","install"].includes(screen))notFound();return <SettleK page={screen}/>}
