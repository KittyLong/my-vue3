import { hasOwn } from "../shared/index"

const publciPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props
}
export const PublicInstanceHandlers = {
    get({ _: instance }, key) {
        //setupState
        const { setupState, props } = instance
        if (key in setupState) {
            return setupState[key]
        }
        if (hasOwn(setupState, key)) {
            return setupState[key]
        } else if (hasOwn(props, key)) {
            return props[key]
        }
        const publicGetter = publciPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }

        //setup
        //$data
        // $props
    }
}
