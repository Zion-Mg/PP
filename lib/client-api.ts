export const parseApiResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const body = await response.text();
    throw new Error(
      response.ok
        ? "The server returned an unexpected response."
        : body.includes("<!DOCTYPE")
          ? "The server hit an internal error. Please check the backend configuration and try again."
          : "The server returned an unexpected response.",
    );
  }

  return response.json() as Promise<T>;
};
