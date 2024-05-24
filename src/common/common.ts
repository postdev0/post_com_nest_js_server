export function extractUsername(email: string) {
  const parts = email.split('@');
  return parts[0];
}

export function extractTaggedUsers(tweetContent: string) {
  const regex = /@(\w+)/g;
  return (tweetContent.match(regex) || []).map((match) => match.slice(1));
}
