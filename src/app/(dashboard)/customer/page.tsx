'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useOrderStore, type CartItem } from '../../../store/orderStore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Filter,
  CreditCard,
  Truck,
  ChefHat,
  Heart,
  Share2
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  preparationTime: number;
  image?: string;
  rating?: number;
  isVeg?: boolean;
}

interface Hotel {
  _id: string;
  name: string;
  address: string;
  phone: string;
  deliveryRadius: number;
  menu: MenuItem[];
  isActive: boolean;
  rating?: number;
  deliveryFee?: number;
  minOrderValue?: number;
  estimatedDeliveryTime?: string;
}

export default function CustomerPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { user, isAuthenticated, token } = useAuthStore();
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart,
    getCartTotal, 
    getCartItemCount,
    clearCart
  } = useOrderStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    fetchHotels();
  }, [isAuthenticated, router]);

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHotels(data.hotels || []);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (hotel: Hotel, menuItem: MenuItem, specialInstructions?: string) => {
    const cartItem: CartItem = {
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
      hotelId: hotel._id,
      hotelName: hotel.name,
      specialInstructions
    };
    addToCart(cartItem);
  };

  const getCartItemQuantity = (itemId: string): number => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const openHotelMenu = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsMenuDialogOpen(true);
  };

  const getFilteredMenuItems = (menu: MenuItem[]) => {
    return menu.filter(item => {
      const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  const getUniqueCategories = (menu: MenuItem[]) => {
    const categories = menu.map(item => item.category);
    return ['all', ...Array.from(new Set(categories))];
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading restaurants...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Food Online
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search restaurants or dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {/* TODO: add user.location */}
              <span>Delivering to {'your location'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hotels List */}
          <div className="lg:col-span-2">
            <div className="grid gap-6">
              {hotels
                .filter(hotel => 
                  !searchTerm || 
                  hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  hotel.menu.some(item => 
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                )
                .map((hotel) => (
                <Card key={hotel._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{hotel.name}</CardTitle>
                          <Button variant="ghost" size="sm">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{hotel.rating || '4.2'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{hotel.estimatedDeliveryTime || '30-45 mins'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>Within {hotel.deliveryRadius}km</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{hotel.address}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span>₹{hotel.deliveryFee || 30} delivery fee</span>
                          <span>Min order ₹{hotel.minOrderValue || 200}</span>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Open
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Popular Items Preview */}
                    <div className="space-y-3 mb-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <ChefHat className="w-4 h-4" />
                        Popular Items
                      </h4>
                      {hotel.menu?.slice(0, 3).map((item: MenuItem) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{item.name}</h5>
                              {item.isVeg !== undefined && (
                                <div className={`w-3 h-3 border-2 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                                  <div className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'} mx-auto mt-0.5`}></div>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-lg">₹{item.price}</p>
                              {item.rating && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{item.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {getCartItemQuantity(item.id) === 0 ? (
                              <Button 
                                onClick={() => handleAddToCart(hotel, item)}
                                className="bg-orange-500 hover:bg-orange-600"
                                disabled={!item.isAvailable}
                                size="sm"
                              >
                                {item.isAvailable ? 'ADD' : 'UNAVAILABLE'}
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2 bg-orange-500 text-white rounded-lg px-3 py-2">
                                <button 
                                  onClick={() => updateQuantity(item.id, getCartItemQuantity(item.id) - 1)}
                                  className="hover:bg-orange-600 rounded w-6 h-6 flex items-center justify-center"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center text-sm">{getCartItemQuantity(item.id)}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, getCartItemQuantity(item.id) + 1)}
                                  className="hover:bg-orange-600 rounded w-6 h-6 flex items-center justify-center"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => openHotelMenu(hotel)}
                        className="flex-1"
                        variant="outline"
                      >
                        View Full Menu
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Your Cart ({getCartItemCount()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                    <p className="text-sm text-gray-400">Add items from restaurants to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      From: {cart[0]?.hotelName}
                    </div>
                    
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex-1">
                          <h5 className="font-medium">{item.name}</h5>
                          <p className="text-sm text-gray-600">₹{item.price}</p>
                          {item.specialInstructions && (
                            <p className="text-xs text-gray-500 italic">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>₹{getCartTotal()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee:</span>
                        <span>₹30</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxes:</span>
                        <span>₹{Math.round(getCartTotal() * 0.18)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total:</span>
                          <span className="text-lg">₹{getCartTotal() + 30 + Math.round(getCartTotal() * 0.18)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Button 
                        onClick={proceedToCheckout}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                      </Button>
                      <Button 
                        onClick={clearCart}
                        variant="outline" 
                        className="w-full"
                      >
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Menu Dialog */}
        <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedHotel?.name} - Full Menu</DialogTitle>
            </DialogHeader>
            
            {selectedHotel && (
              <div className="space-y-6">
                {/* Categories Filter */}
                <div className="flex gap-2 flex-wrap">
                  {getUniqueCategories(selectedHotel.menu).map(category => (
                    <Button
                      key={category}
                      variant={categoryFilter === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(category)}
                    >
                      {category === 'all' ? 'All' : category}
                    </Button>
                  ))}
                </div>

                {/* Menu Items */}
                <div className="grid gap-4">
                  {getFilteredMenuItems(selectedHotel.menu).map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      hotel={selectedHotel}
                      quantity={getCartItemQuantity(item.id)}
                      onAdd={handleAddToCart}
                      onUpdateQuantity={updateQuantity}
                    />
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Menu Item Card Component
interface MenuItemCardProps {
  item: MenuItem;
  hotel: Hotel;
  quantity: number;
  onAdd: (hotel: Hotel, item: MenuItem, specialInstructions?: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

function MenuItemCard({ item, hotel, quantity, onAdd, onUpdateQuantity }: MenuItemCardProps) {
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleAdd = () => {
    onAdd(hotel, item, specialInstructions);
    setShowInstructions(false);
    setSpecialInstructions('');
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{item.name}</h3>
            {item.isVeg !== undefined && (
              <div className={`w-4 h-4 border-2 ${item.isVeg ? 'border-green-500' : 'border-red-500'} flex items-center justify-center`}>
                <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg">₹{item.price}</span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{item.preparationTime} mins</span>
            </div>
            {item.rating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{item.rating}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex flex-col items-end gap-2">
          {quantity === 0 ? (
            <div>
              <Button 
                onClick={() => setShowInstructions(!showInstructions)}
                className="bg-orange-500 hover:bg-orange-600 mb-2"
                disabled={!item.isAvailable}
                size="sm"
              >
                {item.isAvailable ? 'ADD' : 'UNAVAILABLE'}
              </Button>
              
              {showInstructions && (
                <div className="w-64 p-3 border rounded-lg bg-white shadow-lg">
                  <Textarea
                    placeholder="Any special instructions?"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="mb-2"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAdd}>
                      Add to Cart
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowInstructions(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-orange-500 text-white rounded-lg px-3 py-2">
              <button 
                onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                className="hover:bg-orange-600 rounded w-6 h-6 flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button 
                onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                className="hover:bg-orange-600 rounded w-6 h-6 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
