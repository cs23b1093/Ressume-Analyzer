import generateToken from "../utils/generateToken.js";

export const createUserAndGetTokens = async (UserModel, userPayload) => {
  const user = new UserModel(userPayload);
  await user.save();
  const tokens = await generateToken(user); // adapt to your API
  return { user, tokens };
}
