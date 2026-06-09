import { useEffect, type CSSProperties } from "react";

interface MoodDNASplashProps {
  onComplete?: () => void;
}

// 공통 path 데이터
const R_LINE = "m 142.3569,38.624422 a 5.8473106,5.8473106 0 0 0 -6.52231,5.085869 c 0,0 -2.18851,13.512755 -10.11994,20.149272 -5.23353,4.379088 -15.22613,13.016605 -24.22577,20.80933 -4.499817,3.896338 -8.739665,7.57355 -11.983466,10.378735 -3.243823,2.80525 -5.820399,4.987602 -5.862319,5.021202 -1.731092,1.38479 -2.500642,2.72223 -3.351756,4.43879 -0.8511,1.7165 -1.543661,3.76011 -1.876465,6.10817 -0.665583,4.69612 0.430027,10.82193 4.982337,15.80112 4.141833,4.5301 12.831779,11.7573 21.391669,18.84225 8.55987,7.0849 17.29735,14.22909 18.15637,15.03756 1.208,1.13701 4.96223,5.32341 8.04936,8.90349 3.08715,3.58001 5.73291,6.75525 5.73291,6.75525 a 5.8473106,5.8473106 0 0 0 8.24349,0.72473 5.8473106,5.8473106 0 0 0 0.73764,-8.23056 c 0,0 -2.70743,-3.22606 -5.86232,-6.88465 -3.15489,-3.65867 -6.53167,-7.56334 -8.89054,-9.78353 -2.70787,-2.54849 -10.22518,-8.50414 -18.71285,-15.52933 -8.48766,-7.02511 -17.641733,-14.91591 -20.214014,-17.72931 -2.161762,-2.36451 -2.310334,-4.31091 -2.031763,-6.2764 0.139285,-0.98282 0.460506,-1.91209 0.776481,-2.54942 0.315986,-0.63742 0.863173,-1.03736 0.18115,-0.49164 1.007145,-0.80571 2.944869,-2.50485 6.198782,-5.31878 3.253934,-2.81393 7.487434,-6.48571 11.983474,-10.378788 8.99209,-7.786174 19.03595,-16.456553 24.08342,-20.679875 12.63052,-10.568422 14.22223,-27.693986 14.22223,-27.693986 a 5.8473106,5.8473106 0 0 0 -5.08582,-6.509366 z";
const L_UP   = "m 71.100421,40.323618 a 5.8473106,5.8473106 0 0 0 -5.639326,6.043369 c 0,0 0.680408,14.330583 12.576364,29.429234 4.268272,5.417556 8.633822,9.780609 12.038789,12.867469 l 9.001701,-7.625296 C 95.995098,78.340812 91.588252,74.09623 87.227474,68.561322 77.302531,55.96433 77.143786,45.966323 77.143786,45.966323 a 5.8473106,5.8473106 0 0 0 -6.043365,-5.642705 z";
const L_DOWN = "m 98.851266,145.84934 -8.47099,-7.37529 c -3.051717,2.65517 -6.62431,6.07252 -10.131613,10.14193 -11.895956,13.80229 -12.576352,26.90239 -12.576352,26.90239 a 5.8473106,5.3452558 0 0 0 5.639326,5.52635 5.8473106,5.3452558 0 0 0 6.043364,-5.16 c 0,0 0.158759,-9.13818 10.083684,-20.65357 3.310325,-3.84088 6.648649,-7.00287 9.412581,-9.38181 z";
const EYE_CX = "116.15209", EYE_CY = "113.1982";
const VB = "0 0 209.64174 212.09167";
const TR = "translate(-0.35826296)";

const svgStyle = (anim: string): CSSProperties => ({
  position: "absolute", top: 0, left: 0, width: 200, height: 202, opacity: 0, animation: anim
});

export default function MoodDNASplash({ onComplete }: MoodDNASplashProps) {
  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 3200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ background: "#07192e" }}>

      <div style={{ position: "relative", width: 200, height: 202 }}>

        {/* 배경 + 물고기 */}
        <svg style={svgStyle("md-fadeIn 0.5s ease forwards 0.2s")} viewBox={VB}>
          <g transform={TR}>
            <circle fill="#0d2540" cx="104.44759" cy="107.90867" r="94.335114"/>
            <path fill="#ffffff" d={R_LINE}/>
          </g>
        </svg>

        {/* eye */}
        <svg style={svgStyle("md-popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards 0.65s")} viewBox={VB}>
          <ellipse fill="#ffffff" cx={EYE_CX} cy={EYE_CY} rx="9.4417152" ry="9.7564392" transform={TR}/>
        </svg>

        {/* 물고기 페이드아웃 */}
        <svg style={svgStyle("md-squishOut 0.4s cubic-bezier(0.4,0,1,0.6) forwards 1.2s")} viewBox={VB}>
          <g transform={TR}>
            <circle fill="#0d2540" cx="104.44759" cy="107.90867" r="94.335114"/>
            <path fill="#ffffff" d={R_LINE}/>
          </g>
        </svg>
        <svg style={svgStyle("md-fadeOut 0.35s ease forwards 1.2s")} viewBox={VB}>
          <ellipse fill="#ffffff" cx={EYE_CX} cy={EYE_CY} rx="9.4417152" ry="9.7564392" transform={TR}/>
        </svg>

        {/* 완전체 빙글 */}
        <svg style={{ ...svgStyle("md-squishIn 0.7s cubic-bezier(0.34,1.8,0.64,1) forwards 1.55s, md-spin 8s cubic-bezier(0.4,0,0.6,1) 2.25s infinite"), transformOrigin: "50% 50%" }} viewBox={VB}>
          <g transform={TR}>
            <circle fill="#0d2540" cx="104.44759" cy="107.90867" r="94.335114"/>
            <path fill="#ffffff" d={L_UP}/>
            <path fill="#ffffff" d={L_DOWN}/>
            <path fill="#ffffff" d={R_LINE}/>
            <ellipse fill="#ffffff" cx={EYE_CX} cy={EYE_CY} rx="9.4417152" ry="9.7564392"/>
          </g>
        </svg>
      </div>

      {/* 텍스트 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{
          fontFamily: "'Courier New', monospace", fontSize: 28, fontWeight: 700,
          color: "#e8d5b0", opacity: 0,
          animation: "md-slideUp 0.5s ease forwards 2.0s"
        }}>
          Mood<span style={{ color: "#2abfaa", fontWeight: 400, fontSize: 34 }}>/</span>DNA
        </div>
        <div style={{
          fontSize: 11, color: "#3a6a90", letterSpacing: "0.12em", textTransform: "uppercase",
          opacity: 0, animation: "md-slideUp 0.4s ease forwards 2.2s"
        }}>
          Design Intelligence for Designers
        </div>
        <div style={{
          width: 140, height: 2, background: "#1a3a55", borderRadius: 2, overflow: "hidden",
          opacity: 0, animation: "md-slideUp 0.4s ease forwards 2.3s"
        }}>
          <div style={{
            height: "100%", background: "#2abfaa", borderRadius: 2, width: 0,
            animation: "md-loadBar 1.2s ease forwards 2.4s"
          }}/>
        </div>
      </div>

      <style>{`
        @keyframes md-fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes md-fadeOut   { from{opacity:1} to{opacity:0} }
        @keyframes md-popIn     { 0%{opacity:0;transform:scale(0.1)} 100%{opacity:1;transform:scale(1)} }
        @keyframes md-squishOut { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0.85)} }
        @keyframes md-squishIn  { 0%{opacity:0;transform:scale(0.85)} 70%{opacity:1;transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
        @keyframes md-spin      { 0%{transform:rotate(0deg)} 30%{transform:rotate(100deg)} 70%{transform:rotate(260deg)} 100%{transform:rotate(360deg)} }
        @keyframes md-slideUp   { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes md-loadBar   { 0%{width:0} 60%{width:75%} 85%{width:90%} 100%{width:100%} }
      `}</style>
    </div>
  );
}
