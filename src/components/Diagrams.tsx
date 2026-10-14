export function CircuitDiagram({compact=false}:{compact?:boolean}){
 return <svg className={compact?'mini-diagram':'circuit-diagram'} viewBox={compact?'0 0 520 290':'0 0 620 290'} role="img" aria-label="理想电压源串联电阻的闭合回路与电压波形示意">
  <defs><pattern id={compact?'small-grid':'grid'} width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#e7eeec" strokeWidth=".7"/></pattern></defs>
  {!compact&&<rect width="620" height="290" fill="url(#grid)"/>}
  <g fill="none" stroke="#23384a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
   <path d="M65 126V72H132m58 0h65v158H65v-58"/><circle cx="65" cy="150" r="24"/>
   <path d="M51 150q7-22 14 0t14 0M132 72l5-12 9 24 9-24 9 24 9-24 9 24 8-12"/>
   <path d="M255 230v12m-16 0h32m-26 7h20m-15 6h10"/>
  </g>
  <g fill="#23384a" fontSize="16" fontFamily="Georgia,serif"><text x="152" y="45">R</text><text x="20" y="109">vₛ(t)</text><text x="145" y="110">vᵣ(t)</text></g>
  {!compact&&<g transform="translate(100 0)"><g stroke="#bac7c5" fill="none"><path d="M333 145H492M341 224V62"/><path d="M333 101H492M333 189H492" strokeDasharray="4 5"/></g><path d="M341 145C357 85 375 85 391 145S425 205 441 145S475 85 491 145" fill="none" stroke="#21634b" strokeWidth="2"/><g fill="#667b78" fontSize="12"><text x="324" y="145">0</text><text x="335" y="52">v(t)</text><text x="498" y="150">t</text><text x="341" y="268">波形示意 · 非实测</text></g></g>}
 </svg>;
}
export function MiniSymbol({kind}:{kind:string}){return <svg viewBox="0 0 130 90" className="mini-symbol" aria-hidden="true"><g stroke="currentColor" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{kind==='ohm'?<><path d="M10 45H32l5-10 8 20 8-20 8 20 8-20 8 20 5-10H117"/><circle cx="10" cy="45" r="3"/><circle cx="117" cy="45" r="3"/><text x="38" y="18" fill="currentColor" stroke="none" fontSize="15">V = IR</text><text x="40" y="82" fill="currentColor" stroke="none" fontSize="15">P = VI</text></>:kind==='amp'?<><path d="M45 10v50l45-25-45-25M9 22h36M30 48h15M90 35h30M114 35v35H90M70 70H30V48M30 70v3m0 9v4m-8 0h16m-13 3h10"/><rect x="70" y="65" width="20" height="10"/><rect x="26" y="73" width="8" height="9"/><text x="49" y="26" fill="currentColor" stroke="none" fontSize="12">+</text><text x="49" y="52" fill="currentColor" stroke="none" fontSize="12">−</text></>:<><path d="M43 18h23a28 28 0 0 1 0 56H43ZM13 32h30M13 59h30M95 46h25"/><text x="3" y="25" fill="currentColor" stroke="none" fontSize="11">A</text><text x="3" y="73" fill="currentColor" stroke="none" fontSize="11">B</text></>}</g></svg>}
