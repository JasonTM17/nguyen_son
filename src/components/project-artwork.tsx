type ProjectArtworkProps = { readonly repositoryName: string; readonly fullName?: string };

const conceptByRepository: Record<string, number> = {
  FoodDelivery_App: 0,
  Money_Management_App: 1,
  VN_TravelAI: 2,
  App_AI_powered_waste_sorting: 3,
  Ecommerce_BookStore: 5,
  JobHunter_SpringBoot_RestfulAPI_React: 6,
  Laptopshop_Spring_Boot_MVC: 7,
  HealthCare_Project: 8,
  Student_Management_UTE: 9,
};

// Decorative concept illustrations, not screenshots of the actual applications.
export function ProjectArtwork({ repositoryName, fullName = `JasonTM17/${repositoryName}` }: ProjectArtworkProps) {
  const index = fullName === `JasonTM17/${repositoryName}` && Object.hasOwn(conceptByRepository, repositoryName) ? conceptByRepository[repositoryName] : 4;
  return (
    <div className={`project-artwork project-artwork--${index}`} aria-hidden="true">
      <svg viewBox="0 0 560 240" fill="none" focusable="false">
        {index === 5 && <>
          <circle cx="284" cy="125" r="96" stroke="#BD9363" opacity=".16" /><path d="M69 201H491" stroke="#C9AE8A" strokeWidth="2" />
          <rect x="132" y="168" width="276" height="24" rx="6" fill="#294D48" /><path d="M151 180H390" stroke="#DCE6D7" strokeWidth="3" />
          <rect x="151" y="145" width="241" height="22" rx="5" fill="#D79660" />
          <path d="M280 57C248 40 202 40 169 54V144C206 133 247 135 280 153C313 135 354 133 391 144V54C358 40 312 40 280 57Z" fill="#FFFCF4" stroke="#55766B" strokeWidth="3" strokeLinejoin="round" />
          <path d="M280 58V152M190 72C213 67 237 69 257 78M190 89C213 84 237 86 257 95M190 106C213 101 237 103 257 112M302 78C323 69 347 67 370 72M302 95C323 86 347 84 370 89M302 112C323 103 347 101 370 106" stroke="#B5C9BC" strokeWidth="3" strokeLinecap="round" />
          <path d="M332 47V98L345 88L358 98V47" fill="#DB9760" />
          <circle cx="431" cy="78" r="23" fill="#F8E6C5" /><path d="M421 77H441M431 67V87" stroke="#9A693D" strokeWidth="3" strokeLinecap="round" />
        </>}
        {index === 6 && <>
          <path d="M0 60H560M0 120H560M0 180H560M70 0V240M140 0V240M210 0V240M280 0V240M350 0V240M420 0V240M490 0V240" stroke="#536B99" opacity=".07" />
          <rect x="103" y="76" width="223" height="129" rx="15" fill="#2A4266" /><path d="M174 76V58C174 52 179 47 185 47H244C250 47 255 52 255 58V76" stroke="#2A4266" strokeWidth="9" />
          <path d="M104 117C162 145 266 145 325 117" stroke="#7F9CB9" strokeWidth="3" /><rect x="201" y="126" width="26" height="22" rx="4" fill="#D6AE71" />
          <rect x="304" y="35" width="142" height="159" rx="13" fill="#FFFCF5" stroke="#CBD4DF" /><circle cx="341" cy="71" r="14" fill="#D4E2D8" />
          <path d="M366 66H423M366 78H403M326 106H423M326 121H409M326 136H416" stroke="#B7C7D8" strokeWidth="4" strokeLinecap="round" />
          <rect x="326" y="157" width="71" height="17" rx="8.5" fill="#D4E4DA" />
          <circle cx="459" cy="178" r="23" fill="#4C8777" stroke="#F7FAF7" strokeWidth="4" /><path d="m449 178 7 7 13-15" stroke="#FFFDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>}
        {index === 7 && <>
          <circle cx="279" cy="118" r="101" stroke="#8C9AB6" opacity=".18" /><circle cx="279" cy="118" r="139" stroke="#8C9AB6" opacity=".1" />
          <rect x="135" y="37" width="291" height="163" rx="12" fill="#253D57" /><rect x="146" y="48" width="269" height="141" rx="5" fill="#F8FAF2" />
          <path d="M123 200H438L462 215H99L123 200Z" fill="#7693AA" /><path d="M250 201H311L320 208H241Z" fill="#CDDBE2" />
          <rect x="164" y="66" width="126" height="104" rx="7" fill="#DFE9E7" /><path d="M189 89H263V139H189Z" fill="#496B80" /><path d="M183 144H269" stroke="#496B80" strokeWidth="5" strokeLinecap="round" />
          <path d="M307 78H391M307 94H363M307 118H375" stroke="#A8C0BE" strokeWidth="5" strokeLinecap="round" /><rect x="306" y="139" width="83" height="23" rx="11" fill="#D7AE70" />
          <circle cx="443" cy="72" r="25" fill="#F6E4BE" /><path d="M431 63H436L440 78H454L458 66H437M442 85H443M451 85H452" stroke="#9A6B3E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>}
        {index === 8 && <>
          <path d="M65 133H134L149 107L169 159L190 122H225" stroke="#86B8B1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="221" y="37" width="215" height="172" rx="14" fill="#FFFDF7" stroke="#BBD6D1" /><path d="M222 83H435" stroke="#DCE8E2" />
          <rect x="241" y="52" width="104" height="14" rx="7" fill="#D3E6DF" /><path d="M254 106H276M307 106H329M361 106H383M254 134H276M307 134H329M361 134H383M254 162H276M307 162H329" stroke="#B5CEC5" strokeWidth="7" strokeLinecap="round" />
          <circle cx="376" cy="164" r="22" fill="#3E8275" /><path d="m366 164 7 7 14-15" stroke="#FFFDF5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="163" cy="76" r="44" fill="#D9EAE1" stroke="#FFFDF7" strokeWidth="6" /><path d="M163 52V100M139 76H187" stroke="#498879" strokeWidth="13" strokeLinecap="round" />
          <rect x="92" y="179" width="108" height="24" rx="12" fill="#F2DBB5" /><circle cx="106" cy="191" r="4" fill="#B58C56" /><path d="M119 191H181" stroke="#C7A476" strokeWidth="3" strokeLinecap="round" />
        </>}
        {index === 9 && <>
          <circle cx="287" cy="122" r="99" stroke="#A1A4C5" opacity=".21" />
          <rect x="141" y="136" width="265" height="62" rx="10" fill="#6F7DA8" /><path d="M158 148H405V185H158C146 185 146 148 158 148Z" fill="#FFFDF7" /><path d="M173 160H375M173 173H345" stroke="#D6DACA" strokeWidth="3" strokeLinecap="round" />
          <path d="m278 37-119 48 119 48 119-48-119-48Z" fill="#2E4266" /><path d="M201 103V132C239 155 313 155 354 132V103L278 134L201 103Z" fill="#52678D" />
          <path d="M390 88V142" stroke="#D7AE69" strokeWidth="4" strokeLinecap="round" /><path d="m390 138-9 21h18l-9-21Z" fill="#D7AE69" />
          <rect x="413" y="128" width="53" height="65" rx="8" fill="#FFFDF7" stroke="#D8D6CA" /><path d="M423 146H455M423 159H445M423 172H450" stroke="#B9CBBE" strokeWidth="3" strokeLinecap="round" />
          <circle cx="115" cy="102" r="18" fill="#EBD8B8" /><path d="M107 102H123M115 94V110" stroke="#A0834F" strokeWidth="2.5" strokeLinecap="round" />
        </>}
        {index === 4 && <>
          <path d="M0 60H560M0 120H560M0 180H560M70 0V240M140 0V240M210 0V240M280 0V240M350 0V240M420 0V240M490 0V240" stroke="currentColor" opacity=".06" />
          <rect x="100" y="34" width="360" height="172" rx="15" fill="#FFFCF5" stroke="#C4D5CD" />
          <path d="M100 71H460" stroke="#D7E1D8" />
          <circle cx="122" cy="53" r="4" fill="#DFB586" /><circle cx="137" cy="53" r="4" fill="#AAC8B5" /><circle cx="152" cy="53" r="4" fill="#8CA8B5" />
          <path d="m156 109-13 13 13 13m42-26 13 13-13 13m-29 7 15-35" stroke="#40766A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M239 110H411M239 124H372M239 138H391" stroke="#CCD9D1" strokeWidth="5" strokeLinecap="round" />
          <text x="124" y="181" fill="#304C4B" fontSize="13" fontFamily="ui-monospace, monospace">{repositoryName.slice(0, 37)}</text>
        </>}
        {index === 0 && <>
          <path d="M0 48H560M0 96H560M0 144H560M0 192H560M56 0V240M112 0V240M168 0V240M224 0V240M280 0V240M336 0V240M392 0V240M448 0V240M504 0V240" stroke="currentColor" opacity=".09" />
          <path d="M80 171H156C177 171 177 103 203 103H340C364 103 364 61 389 61H483" stroke="#7FBAA6" strokeWidth="23" strokeLinecap="round" opacity=".22" />
          <path d="M80 171H156C177 171 177 103 203 103H340C364 103 364 61 389 61H483" stroke="#357764" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 7" />
          <circle cx="81" cy="171" r="10" fill="#357764" stroke="#FFFDF5" strokeWidth="4" /><circle cx="483" cy="61" r="10" fill="#D78746" stroke="#FFFDF5" strokeWidth="4" />
          <rect x="235" y="40" width="109" height="162" rx="18" fill="#214C42" transform="rotate(9 235 40)" />
          <rect x="242" y="48" width="95" height="145" rx="12" fill="#FFFBEE" transform="rotate(9 242 48)" />
          <g transform="rotate(9 242 48)"><rect x="254" y="66" width="70" height="57" rx="8" fill="#D8E9D9" /><circle cx="289" cy="94" r="19" fill="#F3C487" /><path d="M277 93H301M280 99H298" stroke="#8F552F" strokeWidth="4" strokeLinecap="round" /><rect x="254" y="136" width="52" height="5" rx="2.5" fill="#214C42" /><rect x="254" y="148" width="66" height="4" rx="2" fill="#CDD9CB" /><rect x="254" y="166" width="70" height="15" rx="7.5" fill="#357764" /></g>
          <rect x="75" y="55" width="118" height="46" rx="12" fill="#FFFDF5" /><circle cx="98" cy="78" r="10" fill="#E2EDE2" /><path d="m94 78 3 3 5-6" stroke="#357764" strokeWidth="2" strokeLinecap="round" /><path d="M117 73H172M117 83H151" stroke="#86A594" strokeWidth="4" strokeLinecap="round" />
        </>}
        {index === 1 && <>
          <circle cx="285" cy="123" r="102" stroke="#7283C0" strokeOpacity=".15" /><circle cx="285" cy="123" r="143" stroke="#7283C0" strokeOpacity=".1" />
          <rect x="266" y="34" width="181" height="168" rx="16" fill="#FFFCF6" transform="rotate(6 266 34)" />
          <g transform="rotate(6 266 34)"><path d="M288 61H355" stroke="#34476C" strokeWidth="5" strokeLinecap="round" /><path d="M288 76H329" stroke="#CBD0E0" strokeWidth="4" strokeLinecap="round" /><rect x="291" y="141" width="19" height="37" rx="4" fill="#D6DEF0" /><rect x="322" y="118" width="19" height="60" rx="4" fill="#B8C8E3" /><rect x="353" y="128" width="19" height="50" rx="4" fill="#8AA6CE" /><rect x="384" y="97" width="19" height="81" rx="4" fill="#3D5F96" /></g>
          <rect x="110" y="84" width="222" height="126" rx="16" fill="#273D62" transform="rotate(-9 110 84)" />
          <g transform="rotate(-9 110 84)"><rect x="133" y="109" width="24" height="20" rx="5" fill="#E2BF81" /><path d="M134 152H206M134 165H179" stroke="#C7D8EA" strokeWidth="5" strokeLinecap="round" /><circle cx="284" cy="176" r="12" fill="#7898BD" /><circle cx="299" cy="176" r="12" fill="#B5C8DF" fillOpacity=".8" /></g>
        </>}
        {index === 2 && <>
          <circle cx="359" cy="75" r="39" fill="#E5AF70" /><path d="m0 186 120-111 105 91 81-60 100 80 86-78 68 48v84H0Z" fill="#B4C8B8" /><path d="m0 222 168-91 88 71 65-45 137 83H0Z" fill="#6C9D8C" /><path d="m325 240 126-86 109 53v33Z" fill="#376E60" />
          <path d="M193 199C233 149 321 223 359 161" stroke="#FFF5D7" strokeWidth="3" strokeDasharray="6 7" strokeLinecap="round" />
          <path d="M359 131C347 131 338 140 338 151C338 166 359 181 359 181S380 166 380 151C380 140 371 131 359 131Z" fill="#F8E5BE" /><circle cx="359" cy="151" r="7" fill="#376E60" />
          <rect x="88" y="45" width="139" height="99" rx="14" fill="#FFFCF4" transform="rotate(-7 88 45)" /><g transform="rotate(-7 88 45)"><circle cx="113" cy="71" r="11" fill="#D8E7DA" /><path d="m107 72 5-6 6 6" stroke="#376E60" strokeWidth="2" strokeLinecap="round" /><path d="M137 67H204M137 77H177M106 101H202M106 116H167" stroke="#98B5A4" strokeWidth="5" strokeLinecap="round" /></g>
        </>}
        {index === 3 && <>
          <path d="M0 48H560M0 96H560M0 144H560M0 192H560M56 0V240M112 0V240M168 0V240M224 0V240M280 0V240M336 0V240M392 0V240M448 0V240M504 0V240" stroke="currentColor" opacity=".06" />
          <rect x="88" y="42" width="254" height="151" rx="14" fill="#233A48" /><rect x="98" y="52" width="234" height="131" rx="7" fill="#DAE5DB" /><path d="M194 193V211H236V193M162 214H269" stroke="#405967" strokeWidth="7" strokeLinecap="round" />
          <rect x="144" y="77" width="55" height="80" rx="4" stroke="#3C8C6B" strokeWidth="2" strokeDasharray="5 4" /><rect x="222" y="91" width="78" height="61" rx="4" stroke="#B07B41" strokeWidth="2" strokeDasharray="5 4" /><path d="M159 97H184L181 137H162Z" fill="#62A98B" /><path d="M161 91H181M169 87H173" stroke="#3B705A" strokeWidth="3" strokeLinecap="round" /><path d="m238 111 42-6 5 29-42 6Z" fill="#D6AB74" />
          <rect x="375" y="78" width="90" height="113" rx="12" fill="#FFFBF0" /><circle cx="420" cy="111" r="15" fill="#DDEADC" /><path d="m414 111 4 4 8-8" stroke="#3C8C6B" strokeWidth="2.5" strokeLinecap="round" /><path d="M393 147H447M393 161H432" stroke="#B1C5B8" strokeWidth="5" strokeLinecap="round" /><path d="M348 117H373" stroke="#759A87" strokeWidth="2" strokeDasharray="4 4" />
        </>}
      </svg>
    </div>
  );
}
