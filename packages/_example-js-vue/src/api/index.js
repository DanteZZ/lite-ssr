import { axiosSsrRequestResolver, ofetchSsrRequestResolver } from "@lite-ssr/proxy/shared";
import axios from "axios";
import { ofetch } from 'ofetch';

const ofetchApi = ofetch.create({
    baseURL: '/api',
    onRequest: ofetchSsrRequestResolver,
});

const axiosApi = axios.create({
    baseURL: "/api"
})
axiosApi.interceptors.request.use(axiosSsrRequestResolver)

export {
    ofetchApi,
    axiosApi
}