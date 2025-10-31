import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import {
  BASE_URL_ADMIN,
  BASE_URL_USER,
  GET_BLOG,
  GET_PRIVACY_POLICY,
  VIEW_PROFILE,
} from "../API";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [loginChecked, setLoginChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [homeData, setHomeData] = useState(null);
  const [privacyPolicy, setPrivacyPolicy] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);

  useEffect(() => {
    fetchHomeData();
    fetchPrivacyPolicy();
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUserDetails();
    } else {
      setLoginChecked(true);
      setLoading(false);
    }
  }, [token]);

  const fetchUserDetails = async (access_token) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL_USER}${VIEW_PROFILE}`, {
        headers: { Token: token || access_token },
      });

      if (response.status === 200 && response.data?.data) {
        setUser(response.data.data);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.error("Invalid or expired token.");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoginChecked(true);
      setLoading(false);
    }
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL_ADMIN}/get-home`);
      if (res.data?.data?.[0]) {
        setHomeData(res.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivacyPolicy = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL_ADMIN}${GET_PRIVACY_POLICY}`);
      if (res.status === 200 && res.data?.data) {
        setPrivacyPolicy(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching Privacy Policy", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL_ADMIN}${GET_BLOG}`)
      .then((response) => {
        if (response.data?.data) {
          setBlogs(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const blogsRes = await axios.get(`${BASE_URL_ADMIN}${GET_BLOG}`);

        if (blogsRes.data?.data) {
          const sortedBlogs = blogsRes.data.data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setLatestBlogs(sortedBlogs.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching blog details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        token,
        user,
        setUser,
        loading,
        setLoading,
        loginChecked,
        setLoginChecked,
        fetchUserDetails,
        fetchHomeData,
        homeData,
        setHomeData,
        blogs,
        latestBlogs,
        privacyPolicy,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);