"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      statusBarHeight: 20,
      // 默认值
      currentTab: 0,
      tabs: ["全部课程", "跨境电商", "海外营销", "外贸合规", "融资财税", "物流仓储"],
      courseList: [
        {
          image: "/static/Country/china.jpg",
          tag: "国际贸易",
          tagColor: "#1e90ff",
          tagBg: "#e6f7ff",
          title: "进阶必修八门必修课：跨境电商运营",
          desc: "跨境电商运营全流程解析",
          students: "1.2k",
          price: "免费"
        },
        {
          image: "/static/Country/china.jpg",
          tag: "平台运营",
          tagColor: "#9c27b0",
          tagBg: "#f3e5f5",
          title: "亚马逊全球开店实战：从注册到...",
          desc: "新手卖家快速入门指南",
          students: "865",
          price: "免费"
        },
        {
          image: "/static/Country/china.jpg",
          tag: "数字营销",
          tagColor: "#009688",
          tagBg: "#e0f2f1",
          title: "海外独立站引流策略：Google与...",
          desc: "Facebook广告投放技巧",
          students: "2.5k",
          price: "459"
        },
        {
          image: "/static/Country/china.jpg",
          tag: "物流运输",
          tagColor: "#2196f3",
          tagBg: "#e3f2fd",
          title: "国际物流与供应链管理：海运空运...",
          desc: "降低物流成本的实战技巧",
          students: "980",
          price: "329"
        },
        {
          image: "/static/Country/china.jpg",
          tag: "法律法规",
          tagColor: "#ff5722",
          tagBg: "#fbe9e7",
          title: "跨境电商法律合规：知识产权与税...",
          desc: "规避出海风险的必修课",
          students: "750",
          price: "279"
        },
        {
          image: "/static/Country/china.jpg",
          tag: "语言学习",
          tagColor: "#673ab7",
          tagBg: "#ede7f6",
          title: "商务英语实战：商务谈判与邮件写...",
          desc: "提升跨文化沟通能力",
          students: "1.5k",
          price: "199"
        }
      ]
    };
  },
  onLoad() {
    const sysInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight;
  },
  methods: {
    switchTab(index) {
      this.currentTab = index;
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.statusBarHeight + "px",
    b: common_vendor.p({
      type: "arrowleft",
      size: "24",
      color: "#333333"
    }),
    c: common_vendor.p({
      type: "search",
      size: "24",
      color: "#333333"
    }),
    d: common_vendor.p({
      type: "notification",
      size: "24",
      color: "#333333"
    }),
    e: common_vendor.f($data.tabs, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index,
        c: $data.currentTab === index ? 1 : "",
        d: common_vendor.o(($event) => $options.switchTab(index), index)
      };
    }),
    f: $data.statusBarHeight + 44 + "px",
    g: $data.statusBarHeight + 44 + 50 + "px",
    h: common_vendor.f($data.courseList, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.tag),
        c: item.tagColor,
        d: item.tagBg,
        e: common_vendor.t(item.title),
        f: common_vendor.t(item.desc),
        g: "45b14272-3-" + i0,
        h: common_vendor.t(item.students),
        i: common_vendor.t(item.price),
        j: index
      };
    }),
    i: common_vendor.p({
      type: "person",
      size: "14",
      color: "#999999"
    }),
    j: common_vendor.p({
      type: "left",
      size: "14",
      color: "#666666"
    }),
    k: common_vendor.p({
      type: "right",
      size: "14",
      color: "#666666"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Course/Course.js.map
