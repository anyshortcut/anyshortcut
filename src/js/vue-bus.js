function VueBus(Vue) {
    if (Vue.prototype.$bus) return;

    let bus = new Vue();

    Object.defineProperties(bus, {
        on: {
            get() {
                return this.$on
            }
        },
        once: {
            get() {
                return this.$once
            }
        },
        off: {
            get() {
                return this.$off
            }
        },
        emit: {
            get() {
                return this.$emit
            }
        }
    });

    Object.defineProperty(Vue.prototype, '$bus', {
        get() {
            return bus;
        }
    });
}

export default VueBus;