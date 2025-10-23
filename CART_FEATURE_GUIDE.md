# Cart Feature Implementation Guide

## Overview

This guide explains how the custom AI-generated t-shirt designs are added to the cart and displayed with the design at the same position as in the design studio.

## Features Implemented

### 1. Design Data Tracking
The cart now tracks comprehensive design information including:
- **Image URL**: The base64-encoded AI-generated design
- **Position**: X and Y coordinates where the design is placed on the t-shirt
- **Scale**: The size multiplier of the design
- **Rotation**: The rotation angle in degrees

### 2. Custom Product Creation
When a user generates a design and clicks "Add to Cart", the system:
1. Creates a unique product ID based on timestamp
2. Packages the design with all transformation data
3. Creates a cart item with the product and design information
4. Adds it to the cart context
5. Automatically navigates to the cart page

### 3. Visual Cart Display
The cart page now shows:
- **T-shirt mockup** with the selected color
- **Design overlay** positioned exactly as it was in the design studio
- **Correct scale and rotation** applied to the design
- **Custom AI Design badge** to identify custom products
- **Color preview** showing the selected t-shirt color

## How It Works

### Step 1: Design in Custom Studio
```
User creates design → AI generates image → User adjusts position/scale/rotation
```

### Step 2: Add to Cart
```typescript
const cartItem = {
  product: customProduct,
  quantity: 1,
  size: size,
  color: tShirtColor,
  design: {
    imageUrl: designTexture,
    position: designTransform.position,
    scale: designTransform.scale,
    rotation: designTransform.rotation,
  },
};
```

### Step 3: Display in Cart
The cart renders the design with the same transformations:
```tsx
<div className="design-overlay"
  style={{
    transform: `translate(${item.design.position.x * 0.1}px, ${item.design.position.y * 0.1}px)`,
  }}>
  <img
    src={item.design.imageUrl}
    style={{
      transform: `scale(${item.design.scale * 0.8}) rotate(${item.design.rotation}deg)`,
    }}
  />
</div>
```

## Code Changes

### Modified Files

1. **src/types/cart.ts**
   - Added `DesignData` interface
   - Updated `CartItem` to include optional design data

2. **src/types/product.ts**
   - Added `isCustomDesign` flag to identify custom products

3. **src/pages/CustomDesign/CustomDesign.tsx**
   - Imported cart context and navigation hooks
   - Modified `handleAddToCart` to create custom products
   - Added automatic navigation to cart after adding item

4. **src/pages/Cart.tsx**
   - Added `getColorAdjustedImage` helper function
   - Updated cart item rendering to show t-shirt with design overlay
   - Applied position, scale, and rotation transformations

## User Workflow

### Complete Flow:
1. **Navigate to Custom Studio** (`/custom-design`)
2. **Select t-shirt color** (e.g., white, blue, red)
3. **Choose size** (S, M, L, XL, 2XL)
4. **Enter design prompt** (e.g., "A cosmic galaxy with swirling nebulas")
5. **Generate design** (AI creates the image)
6. **Adjust design**:
   - Drag to position
   - Use scale slider to resize
   - Use rotation slider to rotate
   - Apply color effects
   - Crop if needed
7. **Click "Add to Cart"**
8. **View in cart** - Design appears on t-shirt at same position
9. **Proceed to checkout**

## Visual Examples

### Custom Studio
![Custom Design Page](https://github.com/user-attachments/assets/4c06be67-a839-49d3-8f12-95554b10c9a1)

### Empty Cart
![Empty Cart](https://github.com/user-attachments/assets/41440cd2-9c13-4b18-a2d3-33700697252b)

## Technical Details

### Position Scaling
The design position is scaled by 0.1 in the cart to maintain proper proportions:
```javascript
transform: `translate(${position.x * 0.1}px, ${position.y * 0.1}px)`
```

### Size Scaling
The design scale is multiplied by 0.8 to fit properly in the smaller cart preview:
```javascript
transform: `scale(${scale * 0.8}) rotate(${rotation}deg)`
```

### T-Shirt Color
The t-shirt color is applied using Cloudinary's color replacement transformation:
```javascript
const hex = color.toUpperCase().replace("#", "");
const url = baseUrl.replace(
  /e_replace_color:FFFFFF:60:white/,
  `e_replace_color:${hex}:60:white`
);
```

## Next Steps

The priority task is complete! Users can now:
✅ Generate custom designs with AI
✅ Adjust position, scale, and rotation
✅ Add designs to cart
✅ View designs on t-shirts in cart at the same position

### Future Enhancements:
- Payment integration (Stripe)
- User authentication
- Order management
- Store credit system
- Admin dashboard
- Analytics and reporting

## Support

For issues or questions about the cart feature, please refer to:
- [HuggingFace API Setup Guide](./HUGGINGFACE_API_SETUP.md)
- [Main README](./README.md)
