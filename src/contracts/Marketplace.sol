pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;

    struct Product {
        uint id; 
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address owner,
        bool purchased
    );

    constructor() public{
        name = "silk road";
    }

    function createProduct(string memory _name, uint _price) public {

        require(bytes(_name).length > 0);

        require(_price > 0);
        
        productCount ++;
        
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        
        //emit set's the variable vaules of the event's created above.
        //This stores the name, price and address of the person making the listing
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable {
        
        //Fectching the product they are looking to buy
        Product memory _product = products[_id];

        //Setting up sending the Ether to the seller.
        address payable _seller = _product.owner;

        //making sure there is a product there
        require(_product.id > 0 && _product.id <= productCount);

        //Making sure there's another Ether
        require(msg.value >= _product.price);

        //Checking to see if the product hasn't been bought already
        require(!_product.purchased);

        //Making sure the buyer isn't the seller
        require(_seller != msg.sender);


        _product.owner = msg.sender;

        _product.purchased = true;

        products[_id] = _product;
        
        //Transfering the ether
        address(_seller).transfer(msg.value);

        //updating product informatino and setting it to purchased
        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);

    }
}