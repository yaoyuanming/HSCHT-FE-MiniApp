"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {};
  },
  methods: {
    onNavClick(type) {
      common_vendor.index.__f__("log", "at pages/My/My.vue:54", "Clicked navigation:", type);
    },
    onRecharge() {
      common_vendor.index.__f__("log", "at pages/My/My.vue:58", "Clicked recharge");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $options.onNavClick("company")),
    b: common_vendor.o(($event) => $options.onNavClick("order")),
    c: common_vendor.o(($event) => $options.onNavClick("gov")),
    d: common_vendor.o((...args) => $options.onRecharge && $options.onRecharge(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/My/My.js.map
