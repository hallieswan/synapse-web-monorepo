export const handleErrorRedirect = (error:any) => {
  console.error(error)
  const redirectUri = getSearchParam('redirect_uri')
  if (error["error"] && redirectUri) {
    // is this a valid URL, and has the backend validated the redirect uri (SWC-5596)?
    if (isValidUrl(redirectUri) && error["error"] !== 'invalid_redirect_uri') {
      // we have a redirectUri and an error code from the backend (and possibly an error description!).  Redirect.
      const errorDescription = error["error_description"] ? `&error_description=${encodeURIComponent(error["error_description"])}` : ''
      window.location.replace(`${redirectUri}?${getStateParam()}error=${encodeURIComponent(error["error"])}${errorDescription}`)
    } 
    // no need to pop up an alert here, since the error should be shown on the page (and we already sent to console.error)
  }
}

export const getSearchParam = (keyName: string): string | undefined => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  let paramValue: string | undefined = undefined
  if (urlSearchParams && urlSearchParams.get(keyName)) {
      paramValue = urlSearchParams.get(keyName)!
  }
  return paramValue
}
export const getStateParam = () => {
  let state = getSearchParam('state')
  let stateParam = ''
  if (state) {
      state = encodeURIComponent(state)
      stateParam = `state=${state}&`
  }
  return stateParam
}

export const isValidUrl = (str:string) => {
  try {
    new URL(str);
  } catch (_) {
    return false;  
  }
  return true;
}

export const hexDecodeAndDeserialize =(str:string) => {
  const json = Buffer.from( str, 'hex' ).toString()
  return JSON.parse(json)
}