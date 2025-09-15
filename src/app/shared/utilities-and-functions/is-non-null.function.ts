export const isNonNull = <T>(arg: T): arg is NonNullable<T>  => {
  return !(arg === null || arg === undefined);
};
