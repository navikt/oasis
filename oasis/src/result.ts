interface BaseResult<T, E> {
  isOk(): this is Ok<T, E>;
  isError(): this is Error<T, E>;
  match<B>(opts: { Ok: (value: T) => B; Error: (error: E) => B }): B;
}

type Ok<T, E> = BaseResult<T, E> & {
  get(): T;
};

type Error<T, E> = BaseResult<T, E> & {
  getError(): E;
};

export type Result<T, E> = Ok<T, E> | Error<T, E>;

export const Result = {
  Ok: <T, E>(value: T): Ok<T, E> => ({
    isOk: () => true,
    isError: () => false,
    get: () => value,
    match: ({ Ok }) => Ok(value),
  }),
  Error: <T, E>(error: E): Error<T, E> => ({
    isOk: () => false,
    isError: () => true,
    getError: () => error,
    match: ({ Error }) => Error(error),
  }),
};
