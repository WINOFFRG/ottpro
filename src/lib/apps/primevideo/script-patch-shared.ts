const PRIMEVIDEO_SCRIPT_TARGET_URL_PATTERN =
  /^https:\/\/m\.media-amazon\.com\/images\/.*\.js/i;

const PRIMEVIDEO_SCRIPT_FIND_PATTERN =
  "e=>(null==e?void 0:e.isBonus)||(null==e?void 0:e.sequenceNumber)&&e.sequenceNumber>=1&&e.sequenceNumber<=3";
const PRIMEVIDEO_SCRIPT_REPLACE_WITH = "e=>true";

export function isPrimeVideoTargetScriptUrl(url: string) {
  return PRIMEVIDEO_SCRIPT_TARGET_URL_PATTERN.test(url);
}

export function patchPrimeVideoScriptContent(content: string) {
  if (!content.includes(PRIMEVIDEO_SCRIPT_FIND_PATTERN)) {
    return {
      changed: false,
      content,
    };
  }

  return {
    changed: true,
    content: content.replace(
      PRIMEVIDEO_SCRIPT_FIND_PATTERN,
      PRIMEVIDEO_SCRIPT_REPLACE_WITH,
    ),
  };
}
