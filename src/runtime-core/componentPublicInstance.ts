const publciPropertiesMap={
    $el:(i)=>i.vnode.el
}
export const PublicInstanceHandlers ={
    get({_:instance},key){
        //setupState
        const setupState = instance.setupState
        if(key in setupState){
            return setupState[key]
        }
        const publicGetter = publciPropertiesMap[key]
        if(publicGetter){
            return publicGetter
        }

        //setup
        //$data
    }
}
