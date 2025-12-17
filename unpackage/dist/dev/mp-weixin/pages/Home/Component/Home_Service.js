"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      currentTab: 0,
      currentService: 1,
      // 默认选中第二个 "投资架构设计"
      services: [
        { name: "境外投资备案", icon: "paperclip" },
        { name: "投资架构设计", icon: "map" },
        // 替换为 map 图标
        { name: "公司注册", icon: "shop" },
        { name: "法律服务", icon: "info" },
        // 类似天平
        { name: "知识产权", icon: "circle" },
        // R标
        { name: "财务服务", icon: "staff-filled" },
        { name: "人事服务", icon: "person" },
        { name: "公证认证", icon: "checkbox-filled" }
      ]
    };
  },
  methods: {
    close() {
      this.$emit("close");
    },
    selectTab(index) {
      this.currentTab = index;
    },
    selectService(index) {
      this.currentService = index;
    },
    goToDetail() {
      common_vendor.index.navigateTo({
        url: "/pages/Service/funtion/detail"
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      type: "closeempty",
      size: "24",
      color: "#ffffff"
    }),
    b: common_vendor.o((...args) => $options.close && $options.close(...args)),
    c: $data.currentTab === 0 ? 1 : "",
    d: $data.currentTab === 0 ? 1 : "",
    e: common_vendor.o(($event) => $options.selectTab(0)),
    f: $data.currentTab === 1 ? 1 : "",
    g: $data.currentTab === 1 ? 1 : "",
    h: common_vendor.o(($event) => $options.selectTab(1)),
    i: $data.currentTab === 2 ? 1 : "",
    j: $data.currentTab === 2 ? 1 : "",
    k: common_vendor.o(($event) => $options.selectTab(2)),
    l: common_vendor.f($data.services, (item, index, i0) => {
      return {
        a: "2e62b4fa-1-" + i0,
        b: common_vendor.p({
          type: item.icon,
          size: "30",
          color: $data.currentService === index ? "#ffffff" : "#666666"
        }),
        c: $data.currentService === index ? 1 : "",
        d: common_vendor.t(item.name),
        e: index,
        f: common_vendor.o(($event) => $options.selectService(index), index)
      };
    }),
    m: $data.currentService !== -1
  }, $data.currentService !== -1 ? {
    n: common_vendor.f(1, (item, index, i0) => {
      return {
        a: common_vendor.t(index + 1),
        b: index,
        c: common_vendor.o((...args) => $options.goToDetail && $options.goToDetail(...args), index)
      };
    }),
    o: common_assets._imports_0,
    p: common_vendor.t($data.services[$data.currentService].name)
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/Home/Component/Home_Service.js.map
