export const getCookie = (name) => {
  const cookies = document.cookie.split("; ");
  const target = cookies.find((row) => row.startsWith(name + "="));
  return target ? target.split("=")[1] : null;
};
