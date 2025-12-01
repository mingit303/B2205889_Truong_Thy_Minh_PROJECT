// src/stores/statistics.store.js
import { defineStore } from "pinia";
import { statisticsApi } from "../api/statisticsAPI";

export const useStatisticsStore = defineStore("statistics", {
  state: () => ({
    overview: {
      totalBooks: 0,
      totalReaders: 0,
      borrowing: 0,
      overdue: 0,
    },

    topBooks: [],
    topReaders: [],

    // borrow / return line
    brYear: new Date().getFullYear(),
    brMonths: [],
    brBorrow: [],
    brReturn: [],

    // status pie
    statusMonth: new Date().getMonth() + 1,
    statusYear: new Date().getFullYear(),
    statusLabels: [],
    statusValues: [],

    // fines table
    fineMonth: new Date().getMonth() + 1,
    fineYear: new Date().getFullYear(),
    totalFine: 0,
    fineRecords: [],

    loading: {
      overview: false,
      topBooks: false,
      topReaders: false,
      br: false,
      status: false,
      fines: false,
    },
  }),

  actions: {
    async loadOverview() {
      this.loading.overview = true;
      try {
        const res = await statisticsApi.getOverview();
        this.overview = res.data.data;
      } finally {
        this.loading.overview = false;
      }
    },

    async loadTopBooks() {
      this.loading.topBooks = true;
      try {
        const res = await statisticsApi.getTopBooks();
        this.topBooks = res.data.data || [];
      } finally {
        this.loading.topBooks = false;
      }
    },

    async loadTopReaders() {
      this.loading.topReaders = true;
      try {
        const res = await statisticsApi.getTopReaders();
        this.topReaders = res.data.data || [];
      } finally {
        this.loading.topReaders = false;
      }
    },

    async loadBorrowReturn(year) {
      this.loading.br = true;
      try {
        const y = year || this.brYear;
        const res = await statisticsApi.getBorrowReturn(y);
        const d = res.data.data;
        this.brYear = d.year;
        this.brMonths = d.months;
        this.brBorrow = d.borrow;
        this.brReturn = d.return;
      } finally {
        this.loading.br = false;
      }
    },

    async loadStatusDistribution() {
      this.loading.status = true;
      try {
        const res = await statisticsApi.getStatusDistribution({
          month: this.statusMonth,
          year: this.statusYear,
        });
        const d = res.data.data;
        this.statusMonth = d.month;
        this.statusYear = d.year;
        this.statusLabels = d.labels;
        this.statusValues = d.values;
      } finally {
        this.loading.status = false;
      }
    },

    async loadFines() {
      this.loading.fines = true;
      try {
        const res = await statisticsApi.getFines({
          month: this.fineMonth,
          year: this.fineYear,
        });
        const d = res.data.data;
        this.fineMonth = d.month;
        this.fineYear = d.year;
        this.totalFine = d.totalFine;
        this.fineRecords = d.records;
      } finally {
        this.loading.fines = false;
      }
    },
  },
});
