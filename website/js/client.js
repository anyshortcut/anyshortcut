import axios from "axios";
import config from "./config.js";

let request = axios.create({
    baseURL: config.apiURL,
    contentType: "application/json; charset=utf-8",
    withCredentials: true,
});

// Add custom axios interceptor for custom error handle.
request.interceptors.response.use(response => {
    let code = response.data.code;
    if (code !== 200) {
        return Promise.reject(response.data);
    }
    return response.data.data;
}, error => {
    return Promise.reject(error)
});

export default {
    getAllPrimaryShortcuts() {
        return request.get('/shortcuts?type=primary&nested=false');
    },
    getAllCompoundShortcuts() {
        return request.get('/shortcuts?type=compound&nested=false');
    },
    getSecondaryShortcuts(primaryId) {
        return request.get(`/shortcut/${primaryId}/secondaries`);
    },
    getShortcutWeekStats(shortcutId) {
        return request.get(`/stats/shortcut?shortcut_id=${shortcutId}`);
    },
    getUserOwnedRedeems() {
        return request.get('/user/redeems');
    },
    getUserClaimedRedeems() {
        return request.get('/user/redeems?type=claimed');
    },
    getUserReferralRedeems() {
        return request.get('/user/redeems?type=referral');
    },
    submitStripeToken(token, redeemCode) {
        return request.post('/user/subscription', {token: token, redeem_code: redeemCode});
    },
    getUserSource() {
        return request.get('/user/source');
    },
    updateUserSource(token) {
        return request.put('/user/source', {token: token});
    },
    getUserInfo() {
        return request.get('/user/info');
    },
    getUserSubscription() {
        return request.get('/user/subscription');
    },
    revokeAccessToken() {
        return request.put('/user/access_token');
    },
    checkRedeem(code) {
        return request.get(`/redeem?code=${code}`);
    },
    signOut() {
        return request.post('/user/signout');
    },
}