export const URL = {
    cart: {
        add: 'v1/cart',
        addMultiple: 'v1/cart-items',
        update: 'v1/cart',
        list: 'v1/cart/{cart_session_id}',
        delete: 'v1/cart/{cart_session_id}/{product_slug}',
        deleteAll: 'v1/cart/{cart_session_id}',
    },
    wishlist:{
        add: 'v1/wishlist',
        list: 'v1/wishlist',
        delete: 'v1/wishlist/{user_id}/{wishlist_id}',
    },
    coupon: {
        add: 'v1/coupon-apply',
        remove: 'v1/remove-coupon'
    }
}