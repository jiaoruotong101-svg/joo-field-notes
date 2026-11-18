export function ProjectIllustration({ kind }: { kind: string }) {
  return <svg className="project-illustration" viewBox="0 0 360 220" aria-hidden="true">
    <rect width="360" height="220" rx="28" fill="#D4E6FF" />
    <circle cx="326" cy="8" r="86" fill="#f5f5f2" opacity=".65" />
    <g stroke="#002060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'visual-data-qc' ? <>
        <rect x="36" y="35" width="220" height="139" rx="22" fill="#002060" />
        <rect x="77" y="57" width="104" height="90" rx="18" fill="#96b9eb" stroke="none" />
        <circle cx="129" cy="86" r="19" fill="#f5f5f2" stroke="none" />
        <path d="M96 137Q129 99 162 137" stroke="#f5f5f2" strokeWidth="15" />
        <rect x="231" y="102" width="94" height="84" rx="20" fill="#f5f5f2" />
        <path d="m255 142 12 12 29-32" stroke="#F25767" strokeWidth="5" />
      </> : kind === 'resume-copilot' ? <>
        <rect x="35" y="32" width="116" height="157" rx="22" fill="#f5f5f2" />
        <rect x="212" y="32" width="116" height="157" rx="22" fill="#002060" />
        <g strokeWidth="9"><path d="M57 69h49M57 100h68M57 132h51" /><path d="M234 69h49M234 100h68M234 132h51" stroke="#D4E6FF" /></g>
        <path d="M151 101h61" /><circle cx="181" cy="101" r="14" fill="#F25767" stroke="none" />
      </> : kind === 'url-crawler' ? <>
        <path d="M65 111H180L274 52M180 111l94 57M180 111V45" strokeOpacity=".4" />
        {[[65,111],[180,111],[274,52],[274,168],[180,45]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r={i===1?31:19} fill={i===1?'#F25767':'#f5f5f2'} />)}
        <circle cx="180" cy="111" r="6" fill="#002060" />
      </> : kind === 'huahua' ? <>
        <circle cx="180" cy="112" r="68" strokeOpacity=".2" />
        <g fill="#F25767" stroke="none"><ellipse cx="180" cy="141" rx="35" ry="26" /><ellipse cx="139" cy="101" rx="14" ry="19" transform="rotate(-22 139 101)" /><ellipse cx="171" cy="81" rx="14" ry="19" /><ellipse cx="206" cy="88" rx="14" ry="19" transform="rotate(20 206 88)" /><ellipse cx="229" cy="117" rx="12" ry="17" transform="rotate(35 229 117)" /></g>
        <path d="M73 55v18m-9-9h18M281 152v18m-9-9h18" />
      </> : <>
        {[0,1,2].map(i => <g key={i}><rect x="50" y={31+i*56} width="260" height="44" rx="17" fill={i===1?'#002060':'#f5f5f2'} /><circle cx="76" cy={53+i*56} r="7" fill="#F25767" stroke="none" /><path d={`M101 ${53+i*56}h111`} stroke={i===1?'#D4E6FF':'#002060'} strokeWidth="5" /></g>)}
      </>}
    </g>
  </svg>
}
