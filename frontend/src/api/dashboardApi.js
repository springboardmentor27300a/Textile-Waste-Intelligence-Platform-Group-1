import api from "./axios";


const DashboardAPI = {

  dashboard: async () => {

    const { data } =
      await api.get(
        "/dashboard/"
      );

    return data;
  },


  kpis: async () => {

    const { data } =
      await api.get(
        "/dashboard/kpis"
      );

    return data;
  },


  companies: async () => {

    const { data } =
      await api.get(
        "/dashboard/companies"
      );

    return data;
  },


  summary: async () => {

    const { data } =
      await api.get(
        "/dashboard/companies/summary"
      );

    return data;
  },


  trends: async () => {

    const { data } =
      await api.get(
        "/dashboard/trends"
      );

    return data;
  },

};


export default DashboardAPI;