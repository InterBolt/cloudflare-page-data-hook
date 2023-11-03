const cache = {} as any;

type TProfile = {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: { lat: string; lng: string };
  };
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string; bs: string };
};

type TPost = { userId: number; id: number; title: string; body: string };

export const getPosts = async (): Promise<Array<TPost>> => {
  if (cache["posts"]) {
    return cache["posts"] as Array<TPost>;
  }
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = (await res.json()).slice(0, 3);

  cache["posts"] = posts;
  return posts;
};

export const getProfile = async (params: { id: string }): Promise<TProfile> => {
  if (cache["profile"]) {
    return cache["profile"] as TProfile;
  }
  console.log(params);
  const res = await fetch("https://jsonplaceholder.typicode.com/users/1");
  const profile = await res.json();

  cache["profile"] = profile;
  return profile;
};
