export const customLogger = (message: string, ...rest: string[]) => {
  console.log(new Date(), message, ...rest);
};
