"use client";
import type {AnchorHTMLAttributes} from "react";
import {useRouter} from "next/navigation";

// Vinext's production Link dynamically imports router names that can be
// renamed by the bundler. Keep the supported router import static instead.
export default function Link({href,onClick,target,...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{href:string}){
 const router=useRouter();
 return <a {...props} href={href} target={target} onClick={event=>{
  onClick?.(event);
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||
     (target&&target!=="_self")||props.download!==undefined||!href.startsWith("/")||href.startsWith("//"))return;
  event.preventDefault();
  router.push(href);
 }}/>;
}
