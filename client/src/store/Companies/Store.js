/* eslint no-param-reassign: ["error", { "props": false }] */
import Vue from 'vue';
import Vuex from 'vuex';
import Axios from 'axios';

import { storeInLocalStorage } from '../../lib/General';
// import mockData from '../../store/Companies/FakeData';

Vue.use(Vuex);
// Vue.prototype.$http = Axios;

const store = new Vuex.Store({
  state: {
    moduleName: 'companies',
    baseUrlCompanies: 'http://localhost:8000/api/shippers/companies',
    baseUrlLocations: 'http://localhost:8000/api/admin/locations',
    pageData: [],
    searchText: '',
    optionSelected: '',
    colsHeaders: [],
    fieldOrderBy: 'company_name',
    orderBy: 'asc',
    pagination: {},
    perPage: 10,
    loading: false,
    showModal: false,
    showImportModal: false,
    isUpdateBtnShow: false,
    isAddBtnDisable: true,
    isUpdateBtnDisable: true,
    closeAfterAction: false,
    locations: [],
    item: {
      id: 'New',
      company_name: '',
      company_legal_name: '',
      company_tax_id: '',
      company_website: '',
      company_contact: '',
      company_email: '',
      company_phone: '',
      company_cellular: '',
      company_address: '',
      company_location: '',
      company_postcode: '',
      company_latitude: '',
      company_longitude: '',
      deleted_at: null,
    },
    message: {
      id: '',
      type: '',
      text: '',
      show: false,
    },
    tableDefaults: {
      optionSelected: -1,
      fieldOrderBy: 'company_name',
      orderBy: 'asc',
      perPage: '10',
    },
    tableParams: {
      optionSelected: '',
      fieldOrderBy: '',
      orderBy: '',
      perPage: '',
    },
  },
  mutations: {
    UPDATE_COLS_HEADERS(state, colsHeaders) {
      state.colsHeaders = colsHeaders;
      storeInLocalStorage(`${state.moduleName}/colsHeaders`, JSON.stringify(colsHeaders));
    },
    UPDATE_PAGEDATA(state, data) {
      state.pageData = data;
    },
    UPDATE_ITEM(state, item) {
      state.item = item;
    },
    RESET_ITEM(state) {
      state.item = {
        id: 'New',
        company_name: '',
        company_legal_name: '',
        company_tax_id: '',
        company_website: '',
        company_contact: '',
        company_email: '',
        company_phone: '',
        company_cellular: '',
        company_address: '',
        company_location: '',
        company_postcode: '',
        company_latitude: '',
        company_longitude: '',
        deleted_at: null,
      };
    },
    UPDATE_PAGINATION(state, pagination) {
      state.pagination = pagination;
    },
    UPDATE_PER_PAGE(state, perPage) {
      state.perPage = perPage;
      state.tableParams.perPage = perPage;
      storeInLocalStorage(`${state.moduleName}/tableParams`, JSON.stringify(state.tableParams));
    },
    UPDATE_SEARCH_TEXT(state, text) {
      state.searchText = text;
    },
    UPDATE_OPTION_SELECT(state, value) {
      state.optionSelected = value;
      state.tableParams.optionSelected = value;
      storeInLocalStorage(`${state.moduleName}/tableParams`, JSON.stringify(state.tableParams));
    },
    UPDATE_LOADING(state, loading) {
      state.loading = loading;
    },
    UPDATE_FIELD_ORDER_BY(state, fieldOrderBy) {
      state.fieldOrderBy = fieldOrderBy;
      state.tableParams.fieldOrderBy = fieldOrderBy;
      storeInLocalStorage(`${state.moduleName}/tableParams`, JSON.stringify(state.tableParams));
    },
    UPDATE_ORDER_BY(state, orderBy) {
      state.orderBy = orderBy;
      state.tableParams.orderBy = orderBy;
      storeInLocalStorage(`${state.moduleName}/tableParams`, JSON.stringify(state.tableParams));
    },
    SHOW_MESSAGE(state, response) {
      state.message.text = (response.data.message) ? response.data.message : 'The operation was NOT executed as expected, try again or please contact the support service';
      state.message.type = (response.data.error || !response.data.message) ? 'danger' : 'info';
      state.message.show = true;
    },
    CLOSE_MESSAGE(state, close) {
      state.message.show = close;
    },
    SHOW_MODAL(state, show) {
      state.showModal = show;
    },
    SHOW_BTN_UPDATE(state, show) {
      state.isUpdateBtnShow = show;
    },
    SHOW_BTN_ADD_DISABLE(state, disable) {
      state.isAddBtnDisable = disable;
    },
    SHOW_BTN_UPDATE_DISABLE(state, disable) {
      state.isUpdateBtnDisable = disable;
    },
    SHOW_CLOSE_AFTERACTION_DEFAULT(state, close) {
      state.closeAfterAction = close;
    },
    SHOW_IMPORT_MODAL(state, show) {
      // state.showImportModal = show;
      Vue.set(state, 'showImportModal', show);
    },
    SET_LOCATIONS(state, locations) {
      state.locations = locations;
    },
    UPDATE_LOCATION(state, location) {
      state.item.company_location = location;
    },
  },
  actions: {
    getData(context, url) {
      return Axios.get(url)
      .then((response) => {
        const pagination = {
          current_page: response.data.current_page,
          from: response.data.from,
          last_page: response.data.last_page,
          next_page_url: response.data.next_page_url,
          path: response.data.path,
          per_page: response.data.per_page,
          prev_page_url: response.data.prev_page_url,
          to: response.data.to,
          total: response.data.total,
        };
        store.commit('UPDATE_PAGINATION', pagination);
        store.commit('UPDATE_PAGEDATA', response.data.data);
      });
    },
    getDataFiltered(context, currentPage) {
      store.commit('UPDATE_LOADING', true);
      const pagination = context.getters.getPagination;
      const page = (!currentPage) ? '' : `page=${currentPage}&`;
      store.dispatch(
        'getData',
        `${pagination.path}?${page}&
          searchText=${context.getters.getSearchText}&
          optionSelected=${context.getters.getOptionSelected}&
          itemsByPage=${pagination.per_page}&
          fieldOrderBy=${context.getters.getFieldOrderBy}&
          orderBy=${context.getters.getOrderBy}`,
        pagination.per_page,
      ).then(() => store.commit('UPDATE_LOADING', false));
    },
    addItem(context, data) {
      store.commit('UPDATE_LOADING', true);
      const pagination = context.getters.getPagination;
      const baseUrl = context.getters.getBaseUrlCompanies;
      return Axios.post(baseUrl, data)
        .then((response) => {
          if (!response.data.error) {
            store.commit('UPDATE_ORDER_BY', 'asc');
            store.commit('UPDATE_FIELD_ORDER_BY', 'id');
            store.dispatch('getDataFiltered', pagination.last_page);
          }
          store.commit('SHOW_MESSAGE', response);
        })
        .then(() => store.commit('UPDATE_LOADING', false));
    },
    updateItem(context, data) {
      store.commit('UPDATE_LOADING', true);
      const pagination = context.getters.getPagination;
      const baseUrl = context.getters.getBaseUrlCompanies;
      return Axios.put(`${baseUrl}/${data.id}`, data)
        .then((response) => {
          if (!response.data.error) {
            store.dispatch('getDataFiltered', pagination.current_page);
          }
          store.commit('SHOW_MESSAGE', response);
        })
        .then(() => store.commit('UPDATE_LOADING', false));
    },
    deleteItem(context, id) {
      store.commit('UPDATE_LOADING', true);
      const pagination = context.getters.getPagination;
      const baseUrl = context.getters.getBaseUrlCompanies;
      return Axios.delete(`${baseUrl}/${id}`, { params: { id } })
        .then((response) => {
          if (!response.data.error) {
            store.dispatch('getDataFiltered', pagination.current_page);
          }
          store.commit('SHOW_MESSAGE', response);
        })
        .then(() => store.commit('UPDATE_LOADING', false));
    },
    importFile(context, file) {
      const formData = new FormData();
      formData.append('fileToImport', file);
      const baseUrl = context.getters.getBaseUrlCompanies;
      return Axios.post(`${baseUrl}/import`, formData)
      .then((response) => {
        if (!response.data.error) {
          store.dispatch('getDataFiltered');
        }
        store.commit('SHOW_IMPORT_MODAL', false);
        store.commit('SHOW_MESSAGE', response);
      })
      .catch((response) => {
        store.commit('SHOW_IMPORT_MODAL', false);
        store.commit('SHOW_MESSAGE', response);
      });
    },
    getLocations(context) {
      const baseUrl = context.getters.getBaseUrlLocations;
      return Axios.get(`${baseUrl}/getAllLocationsActive`)
      .then((response) => {
        const locations = response.data.map(obj => obj.location_name);
        context.commit('SET_LOCATIONS', locations);
      })
      .catch((response) => {
        context.commit('SHOW_MESSAGE', response);
      });
    },
  },
  getters: {
    getModuleName: state => state.moduleName,
    getBaseUrlCompanies: state => state.baseUrlCompanies,
    getPagination: state => state.pagination,
    getPerPage: state => state.perPage,
    getPageData: state => state.pageData,
    getItem: state => state.item,
    getMessage: state => state.message,
    getShowMessage: state => state.message.show,
    getLoading: state => state.loading,
    getShowModal: state => state.showModal,
    getIsUpdateBtnShow: state => state.isUpdateBtnShow,
    getIsAddBtnDisable: state => state.isAddBtnDisable,
    getIsUpdateBtnDisable: state => state.isUpdateBtnDisable,
    getCloseAfterAction: state => state.closeAfterAction,
    getSearchText: state => state.searchText,
    getOptionSelected: state => state.optionSelected,
    getFieldOrderBy: state => state.fieldOrderBy,
    getOrderBy: state => state.orderBy,
    getShowImportModal: state => state.showImportModal,
    getTableDefaults: state => state.tableDefaults,
    getTableParams: state => state.tableParams,
    getLocations: state => state.locations,
    getLocation: state => state.item.company_location,
    getBaseUrlLocations: state => state.baseUrlLocations,
  },
});

export default store;
