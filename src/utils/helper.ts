export const generateRandomQueryString = () => {
  const params = new URLSearchParams();
  const numParams = Math.floor(Math.random() * 5) + 1; // generate between 1 and 5 query parameters
  for (let i = 0; i < numParams; i++) {
    const key = `param${i}`;
    const value = Math.random().toString(36).substring(7); // generate random string
    params.append(key, value);
  }
  return params.toString();
};

export const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const clearPage = () => {
  window.location.reload();
};

export const shuffleRequests = (requests: string[]) => {
  const urls = [...requests];
  for (let a = urls.length - 1; a > 0; a--) {
    const b = Math.floor(Math.random() * (a + 1));
    [urls[a], urls[b]] = [urls[b], urls[a]];
  }
  return urls;
};