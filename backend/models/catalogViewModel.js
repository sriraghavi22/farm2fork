class CatalogViewModel {
    constructor(catalogItem) {
      this.id = catalogItem._id;
      this.cropName = catalogItem.cropName;
      this.farmerName = catalogItem.farmerName;
      this.farmerRating = catalogItem.farmerRating;
      this.pricePerUnit = catalogItem.negotiationPrice;
      this.availableQuantity = catalogItem.quantity;
      this.farmerId = catalogItem.farmerId;
    }
  
    static fromCatalogItem(catalogItem) {
      return new CatalogViewModel(catalogItem);
    }
  
    static fromCatalogItems(catalogItems) {
      return catalogItems.map(item => CatalogViewModel.fromCatalogItem(item));
    }
  }
  
  module.exports = CatalogViewModel;