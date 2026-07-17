// Shared EN/KA text for the Cart & Favorites feature.
// This is deliberately self-contained (not merged into locales/en.json /
// ka.json) since those files weren't shared — drop the strings into your
// existing locale files later if you'd rather route them through t().

export type Lang = 'ka' | 'en';

export const cartFavoritesText = (language: Lang | string | undefined) => {
  const en = language === 'en';

  return {
    cart: {
      title: en ? 'Cart' : 'კალათა',
      ariaLabel: en ? 'Cart' : 'კალათა',
      close: en ? 'Close' : 'დახურვა',
      empty: en
        ? "Your cart is empty.\nAdd items so you don't lose track of them."
        : 'კალათა ცარიელია.\nდაამატე ნივთები, რომ არ დაგავიწყდეს.',
      decrease: en ? 'Decrease' : 'შემცირება',
      increase: en ? 'Increase' : 'გაზრდა',
      remove: en ? 'Remove' : 'წაშლა',
      contactSeller: en ? 'Contact seller' : 'გამყიდველთან დაკავშირება',
      total: en ? 'Total' : 'ჯამი',
      noCheckoutNote: en
        ? "The cart just helps you collect items — payment isn't handled on the site yet, contact the seller directly."
        : 'კალათა გეხმარებათ ნივთების შეგროვებაში — გადახდა საიტზე ჯერ არ ხდება, დაუკავშირდით გამყიდველს პირდაპირ.',
      continueShopping: en ? 'Continue shopping' : 'შენაძენის გაგრძელება',
    },
    addToCart: {
      addShort: en ? 'Cart' : 'კალათაში',
      addedShort: en ? 'Added' : 'დამატებულია',
      add: en ? 'Add to cart' : 'კალათაში დამატება',
      addAgain: en ? 'Add another' : 'დამატება ისევ კალათაში',
      added: en ? 'Added to cart' : 'დამატებულია კალათაში',
      buyNow: en ? 'Buy now' : 'ყიდვა ახლავე',
      ariaAdd: en ? 'Add to cart' : 'კალათაში დამატება',
    },
    favorites: {
      ariaAdd: en ? 'Add to favorites' : 'ფავორიტებში დამატება',
      ariaRemove: en ? 'Remove from favorites' : 'ფავორიტებიდან წაშლა',
      navLabel: en ? 'Favorites' : 'ფავორიტები',
      pageTitle: en ? 'My Favorites' : 'ჩემი ფავორიტები',
      pageSubtitle: en ? "Items you've liked" : 'ნივთები, რომლებიც შენ მოგეწონა',
      emptyText: en
        ? "You haven't favorited anything yet. Browse items and tap the heart to save them here."
        : 'ჯერ არაფერი დაგიმატებია ფავორიტებში. მოძებნე ნივთები და დააჭირე გულის ხატულას, რომ აქ შეინახო.',
      browseCta: en ? 'Browse items' : 'ნივთების დათვალიერება',
    },
  };
};