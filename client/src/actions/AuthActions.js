import * as authApi from "../api/AuthRequests";

export const logIn = (formData, navigate) => async (dispatch) => {
  dispatch({ type: "AUTH_START" });
  try {
    const { data } = await authApi.logIn(formData);
    dispatch({ type: "AUTH_SUCCESS", data: data });
    navigate("/", { replace: true });
  } catch (error) {
    console.log(error);
    dispatch({ type: "AUTH_FAIL", error: error.response.data.error });
  }
};

export const signUp = (formData, navigate) => async (dispatch) => {
  dispatch({ type: "AUTH_START" });
  try {
    const { data } = await authApi.signUp(formData);
    dispatch({ type: "AUTH_SUCCESS", data: data });
    navigate("/", { replace: true });
  } catch (error) {
    console.log(error);
    dispatch({ type: "AUTH_FAIL", error: error.response.data.error });
  }
};

export const googleSignIn = (user, navigate) => async (dispatch) => {
  dispatch({ type: "AUTH_START" });
  try {
    const { data } = await authApi.googleSignIn(user);
    dispatch({ type: "AUTH_SUCCESS", data: data });
    navigate("/", { replace: true });
  } catch (error) {
    dispatch({ type: "AUTH_FAIL", error: error.response.data.error });
  }
};

export const logout = () => async (dispatch) => {
  dispatch({ type: "LOG_OUT" })
}