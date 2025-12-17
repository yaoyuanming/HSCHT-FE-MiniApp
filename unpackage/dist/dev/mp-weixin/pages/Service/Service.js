"use strict";
const common_vendor = require("../../common/vendor.js");
const HomeService = () => "../Home/Component/Home_Service.js";
const _sfc_main = {
  components: {
    HomeService
  },
  data() {
    return {
      // 模拟更多国家数据，全部使用占位图
      countryList: Array.from({ length: 15 }).map((_, i) => ({
        name: "国家名称",
        image: "/static/Country/china.jpg"
      }))
    };
  },
  methods: {
    openPopup() {
      this.$refs.popup.open();
    },
    closePopup() {
      this.$refs.popup.close();
    }
  }
};
if (!Array) {
  const _component_HomeService = common_vendor.resolveComponent("HomeService");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_component_HomeService + _easycom_uni_popup2)();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.countryList, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.name),
        c: index,
        d: common_vendor.o((...args) => $options.openPopup && $options.openPopup(...args), index)
      };
    }),
    b: common_vendor.o($options.closePopup),
    c: common_vendor.sr("popup", "b3c11b84-0"),
    d: common_vendor.p({
      type: "bottom",
      ["safe-area"]: false
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Service/Service.js.map
