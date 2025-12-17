export class User {
    constructor(
        public email: string,
        public name: string,
        public mobile: string,
        public id: string,  
        public delivery_pincode: string,    
        private _token: string,
        private _tokenExpirationDate: Date,
    ) {}

    get token() {       
        if(!this._tokenExpirationDate || new Date > this._tokenExpirationDate) {
            return null;
        }

        return this._token;
    }
}

export class UserShippingAddress{
    shipping_address: [];
}