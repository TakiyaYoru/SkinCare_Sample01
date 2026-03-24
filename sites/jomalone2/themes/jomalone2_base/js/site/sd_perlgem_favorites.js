var prodcat = prodcat || {};
prodcat.ui = prodcat.ui || {};

(function ($, prodcat) {

  $(document).on('perlgem.favorites.fetch', function (e, args) {
    prodcat.ui.getFavorites();
  });

  $(document).on('perlgem.favorites.updateItem', function (e, args) {
    prodcat.ui.addToFavorites({
      skuBaseId: args.skuBaseId
    });
  });

})(jQuery, prodcat);
