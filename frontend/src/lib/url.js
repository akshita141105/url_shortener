import api from "./api";

export const createShortUrl = (data) =>
    api.post("/urls", data);

export const getUrls = () =>
    api.get("/urls");

export const deleteUrl = (shortCode) =>
    api.delete(`/urls/${shortCode}`);

export const getAnalytics = (shortCode) =>
    api.get(`/urls/${shortCode}/analytics`);s