"use strict";
const common_vendor = require("../../common/vendor.js");
const HomeService = () => "./Component/Home_Service.js";
const _sfc_main = {
  components: {
    HomeService
  },
  data() {
    return {
      // 轮播图数据
      swiperList: [
        {
          image: "/static/Country/china.jpg"
        },
        {
          image: "/static/Country/china.jpg"
        },
        {
          image: "/static/Country/china.jpg"
        }
      ],
      countries: [
        {
          name: "美国",
          image: "/static/Country/china.jpg"
        },
        {
          name: "日本",
          image: "/static/Country/china.jpg"
        },
        {
          name: "英国",
          image: "/static/Country/china.jpg"
        },
        {
          name: "法国",
          image: "/static/Country/china.jpg"
        },
        {
          name: "德国",
          image: "/static/Country/china.jpg"
        },
        {
          name: "意大利",
          image: "/static/Country/china.jpg"
        },
        {
          name: "加拿大",
          image: "/static/Country/china.jpg"
        },
        {
          name: "澳大利亚",
          image: "/static/Country/china.jpg"
        }
      ]
    };
  },
  methods: {
    onCountryClick(item) {
      common_vendor.index.__f__("log", "at pages/Home/Home.vue:116", "Clicked country:", item.name);
      this.$refs.servicePopup.open();
    },
    closeServicePopup() {
      this.$refs.servicePopup.close();
    },
    onMoreClick() {
      common_vendor.index.__f__("log", "at pages/Home/Home.vue:124", "Clicked more");
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
    a: common_vendor.f($data.swiperList, (item, index, i0) => {
      return {
        a: item.image,
        b: index
      };
    }),
    b: common_vendor.f($data.countries, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.name),
        c: index,
        d: common_vendor.o(($event) => $options.onCountryClick(item), index)
      };
    }),
    c: common_vendor.o((...args) => $options.onMoreClick && $options.onMoreClick(...args)),
    d: common_vendor.o($options.closeServicePopup),
    e: common_vendor.sr("servicePopup", "4f66011c-0"),
    f: common_vendor.p({
      type: "bottom",
      ["safe-area"]: false
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Home/Home.js.map
