import { redirectPermanently } from "lib/remix";

export async function loader() {
  return redirectPermanently("/menu");
}
