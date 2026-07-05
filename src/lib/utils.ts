import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFlagSvgUrl(fifaCode: string): string {
  if (!fifaCode) return "https://flagcdn.com/un.svg";
  const cleanCode = fifaCode.toUpperCase().trim();

  if (cleanCode === "ENG") return "https://raw.githubusercontent.com/catamphetamine/country-flag-icons/master/flags/3x2/GB-ENG.svg";
  if (cleanCode === "WAL") return "https://raw.githubusercontent.com/catamphetamine/country-flag-icons/master/flags/3x2/GB-WLS.svg";
  if (cleanCode === "SCO") return "https://raw.githubusercontent.com/catamphetamine/country-flag-icons/master/flags/3x2/GB-SCT.svg";
  if (cleanCode === "NIR") return "https://raw.githubusercontent.com/catamphetamine/country-flag-icons/master/flags/3x2/GB-NIR.svg";

  const codeMap: Record<string, string> = {
    ALB:"al",AND:"ad",ARM:"am",AUT:"at",AZE:"az",BLR:"by",BEL:"be",BIH:"ba",BUL:"bg",
    CRO:"hr",CYP:"cy",CZE:"cz",DEN:"dk",EST:"ee",FRO:"fo",FIN:"fi",FRA:"fr",GEO:"ge",
    GER:"de",GIB:"gi",GRE:"gr",HUN:"hu",ISL:"is",IRL:"ie",ISR:"il",ITA:"it",KAZ:"kz",
    KOS:"xk",LVA:"lv",LIE:"li",LTU:"lt",LUX:"lu",MLT:"mt",MDA:"md",MNE:"me",NED:"nl",
    MKD:"mk",NOR:"no",POL:"pl",POR:"pt",ROU:"ro",RUS:"ru",SMR:"sm",SRB:"rs",SVK:"sk",
    SVN:"si",ESP:"es",SWE:"se",SUI:"ch",TUR:"tr",UKR:"ua",
    ARG:"ar",BOL:"bo",BRA:"br",CHI:"cl",COL:"co",ECU:"ec",PAR:"py",PER:"pe",URU:"uy",VEN:"ve",
    AIA:"ai",ATG:"ag",ARU:"aw",BAH:"bs",BRB:"bb",BLZ:"bz",BER:"bm",VGB:"vg",CAN:"ca",
    CAY:"ky",CRC:"cr",CUB:"cu",CUW:"cw",DMA:"dm",DOM:"do",SLV:"sv",GRN:"gd",GUA:"gt",
    GUY:"gy",HAI:"ht",HON:"hn",JAM:"jm",MEX:"mx",MSR:"ms",NCA:"ni",PAN:"pa",PUR:"pr",
    SKN:"kn",LCA:"lc",VIN:"vc",SUR:"sr",TRI:"tt",TCA:"tc",USA:"us",VIR:"vi",
    ALG:"dz",ANG:"ao",BEN:"bj",BOT:"bw",BFA:"bf",BDI:"bi",CPV:"cv",CMR:"cm",CTA:"cf",
    CHA:"td",COM:"km",COD:"cd",CGO:"cg",DJI:"dj",EGY:"eg",EQG:"gq",ERI:"er",SWZ:"sz",
    ETH:"et",GAB:"ga",GAM:"gm",GHA:"gh",GUI:"gn",GNB:"gw",CIV:"ci",KEN:"ke",LES:"ls",
    LBR:"lr",LBY:"ly",MAD:"mg",MWI:"mw",MLI:"ml",MTN:"mr",MRI:"mu",MAR:"ma",MOZ:"mz",
    NAM:"na",NIG:"ne",NGA:"ng",RWA:"rw",STP:"st",SEN:"sn",SEY:"sc",SLE:"sl",SOM:"so",
    RSA:"za",SSD:"ss",SDN:"sd",TAN:"tz",TOG:"tg",TUN:"tn",UGA:"ug",ZAM:"zm",ZIM:"zw",
    AFG:"af",AUS:"au",BHR:"bh",BAN:"bd",BHU:"bt",BRU:"bn",CAM:"kh",CHN:"cn",TPE:"tw",
    GUM:"gu",HKG:"hk",IND:"in",IDN:"id",IRN:"ir",IRQ:"iq",JPN:"jp",JOR:"jo",PRK:"kp",
    KOR:"kr",KUW:"kw",KGZ:"kg",LAO:"la",LBN:"lb",MAC:"mo",MAS:"my",MDV:"mv",MNG:"mn",
    MYA:"mm",NEP:"np",OMA:"om",PAK:"pk",PLE:"ps",PHI:"ph",QAT:"qa",KSA:"sa",SGP:"sg",
    SRI:"lk",SYR:"sy",TJK:"tj",THA:"th",TLS:"tl",TKM:"tm",UAE:"ae",UZB:"uz",VIE:"vn",YEM:"ye",
    ASA:"as",COK:"ck",FIJ:"fj",NCL:"nc",NZL:"nz",PNG:"pg",SAM:"ws",SOL:"sb",TAH:"pf",TGA:"to",VAN:"vu",
  };

  const isoCode = codeMap[cleanCode];
  if (!isoCode) return `https://flagcdn.com/${cleanCode.substring(0, 2).toLowerCase()}.svg`;
  return `https://flagcdn.com/${isoCode}.svg`;
}

export function getTeamLogoUrl(team: { fifaCode: string; flagUrl?: string }): string {
  if (team.flagUrl) return team.flagUrl;
  return getFlagSvgUrl(team.fifaCode);
}
