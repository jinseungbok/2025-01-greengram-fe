export const checkValidation = () => {
  const validList = document.querySelectorAll('.valid');
  console.log('validList:', validList);
  if(validList.length > 0) { // 유효성 검사를 해야 하는 input이 하나 이상이라면
    // validList는 유사배열
    // Array.from(validList) 진짜 배열로 전환

    // reduce는 하나로 만들 때 사용
    // 여러 개의 유효성에 걸리는 message 문자열들을 하나의 문자열로 만드는 작업
    const result = Array.from(validList).reduce((prev, item) => {
      let message = ''
      const value = item.value.trim();
      const notNull = item.getAttribute('not-null');
      if(notNull === 'true' && value.length === 0) {
        message = item.getAttribute('not-null-message') + '\n';
      } else {
        const regexp = item.getAttribute('regexp');
        const regexpObj = new RegExp(regexp);

        if(!value.match(regexpObj)) {
          message += item.getAttribute('regexp-message') + '\n';
        }
      }
      return prev + message;
    }, '');
    if(result.length > 0) {
      alert(result);
    }
    return result.length > 0
  }
  return false;
}