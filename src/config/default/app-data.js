const cdn_url =
    'https://res.cloudinary.com/aviabird/image/upload/h_500/v1538842572/aviacommerce/';

export const DEFAULT_APP_DATA = {
    landing_page_banner: [
        {
            image_link: `${cdn_url}banner-1.jpg`,
            link_url: '#'
        },
        {
            image_link: `${cdn_url}banner-2.jpg`,
            link_url: '#'
        },
        {
            image_link: `${cdn_url}banner-4.jpg`,
            link_url: '#'
        },
        {
            image_link: `${cdn_url}banner-5.jpg`,
            link_url: '#'
        },
        {
            image_link: `${cdn_url}banner-6.jpg`,
            link_url: '#'
        }
    ],
    promo_banner: {
        image_link: `${cdn_url}secondary-banner-1.jpg`,
        link_url: '#'
    },
    category_banner: {
        Living: {
            image_link: `${cdn_url}banner-1.jpg`,
            link_url: '#'
        },
        Bedroom: {
            image_link: `${cdn_url}banner-2.jpg`,
            link_url: '#'
        },
        Dining: {
            image_link: `${cdn_url}banner-3.jpg`,
            link_url: '#'
        },
        Study: {
            image_link: `${cdn_url}banner-4.jpg`,
            link_url: '#'
        }
    },
    Deals: {
        type: "Today's Deals"
    },

    footer_page_links: [
        {
            name: 'About Us',
            link_url: '/about-us',
            target: 'self'
        },
        {
            name: 'Brands',
            link_url: '/brands',
            target: 'self'
        },
        {
            name: 'Contact Us',
            link_url: '/contact',
            target: 'self'
        },
        {
            name: 'Careers',
            href_url: 'https://jobs.tradesala.com',
            target: '_blank'
        },
        {
            name: 'Privacy Policy',
            link_url: '/privacy-policy',
            target: 'self'
        },
        {
            name: 'Terms & Conditions',
            link_url: '/terms-and-condition',
            target: 'self'
        },
        /*{
            name: 'Help & FAQ',
            link_url: false
        },*/
        {
            name: 'Return & Refund Policy',
            link_url: '/return-refund-policy',
            target: 'self'
        },
        {
            name: 'Shipping Policy',
            link_url: '/shipping-policy',
            target: 'self'
        },
    ],
    footer_social_links: [
        {
            link_url: 'https://www.facebook.com/Tradesala-E-Commerce-337852827456868',
            name: 'Facebook',
            icon: 'fa fa-facebook-square'
        },
        {
            link_url: 'https://twitter.com/tradesala',
            name: 'Twitter',
            icon: 'fa fa-twitter-square'
        },
        {
            link_url: 'https://www.instagram.com/tradesala/',
            name: 'Instagram',
            icon: 'fa fa-instagram'
        },
        {
            link_url: 'https://www.youtube.com/channel/UC8VDikLV7MOcQLnBspIEDig',
            name: 'Youtube',
            icon: 'fa fa-youtube-square'
        },
        {
            link_url: 'https://www.linkedin.com/company/tradesala',
            name: 'LinkedIn',
            icon: 'fa fa-linkedin-square'
        },
    ],
    contact_info: {
        contact_no: '888-888-xxx',
        copyright: 'Copyright © 2022 Tradesala.com. All Rights Reserved.'
    }
};
