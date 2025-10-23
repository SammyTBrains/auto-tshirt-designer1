# AI T-Shirt Designer Workflow

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HOMEPAGE                                     │
│  User clicks "Custom Studio" in navigation                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CUSTOM DESIGN STUDIO                              │
│                                                                      │
│  Step 1: Select T-Shirt Color                                       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                                       │
│  │ ⬜ │ │ 🔵 │ │ 🔴 │ │ 🟢 │  ... more colors                      │
│  └────┘ └────┘ └────┘ └────┘                                       │
│                                                                      │
│  Step 2: Choose Size                                                │
│  [ S ]  [ M ]  [ L ]  [ XL ]  [ 2XL ]                              │
│                                                                      │
│  Step 3: Generate Design                                            │
│  ┌────────────────────────────────────────────────────┐            │
│  │ "A cosmic galaxy with swirling nebulas"            │            │
│  └────────────────────────────────────────────────────┘            │
│  [🎨 Generate Design]                                               │
│                                                                      │
│  Step 4: Customize Design (After Generation)                        │
│  ┌──────────────────────────────────┐                              │
│  │     T-Shirt Preview               │                              │
│  │  ┌──────────────────────┐        │                              │
│  │  │   👕 T-Shirt         │        │                              │
│  │  │                      │        │                              │
│  │  │      ┌────┐          │        │                              │
│  │  │      │ 🎨 │ Design   │        │ ← Drag to position          │
│  │  │      └────┘          │        │                              │
│  │  │                      │        │                              │
│  │  └──────────────────────┘        │                              │
│  └──────────────────────────────────┘                              │
│                                                                      │
│  Controls:                                                           │
│  • Rotation: [────●────────] 0°                                     │
│  • Scale:    [─────●───────] 1.0x                                   │
│  • Color Effect: [●─────────] 0%                                    │
│                                                                      │
│  [➕ Add to Cart]                                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SHOPPING CART                                  │
│                                                                      │
│  🛒 Your Cart                                                        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ┌────────┐                                                   │ │
│  │  │  👕    │  Custom AI-Generated T-Shirt                     │ │
│  │  │        │                                                   │ │
│  │  │  ┌─┐   │  Size: M                                         │ │
│  │  │  │🎨│  │  Color: ⬜ White                                  │ │
│  │  │  └─┘   │  [Custom AI Design]                              │ │
│  │  │        │                                                   │ │
│  │  └────────┘  Quantity: [-] 1 [+]                $29.99       │ │
│  │                                                 🗑️ Remove      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────┐                                │
│  │ Order Summary                  │                                │
│  │ Subtotal:           $29.99     │                                │
│  │ Shipping:            $4.99     │                                │
│  │ ───────────────────────────    │                                │
│  │ Total:              $34.98     │                                │
│  │                                 │                                │
│  │ [Proceed to Checkout →]        │                                │
│  └────────────────────────────────┘                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────┐
│   User Input    │
│  - Prompt       │
│  - Color        │
│  - Size         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  HuggingFace API        │
│  (Stable Diffusion)     │
│  - Generates Image      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Design Transform       │
│  - position: {x, y}     │
│  - scale: number        │
│  - rotation: degrees    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Cart Item              │
│  {                      │
│    product: {...},      │
│    design: {            │
│      imageUrl,          │
│      position,          │
│      scale,             │
│      rotation           │
│    }                    │
│  }                      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Cart Display           │
│  - T-shirt + Design     │
│  - Same position        │
│  - Same scale           │
│  - Same rotation        │
└─────────────────────────┘
```

## Key Features

### 1. Real-Time Preview
- User sees design on t-shirt immediately
- All transformations are applied in real-time
- WYSIWYG (What You See Is What You Get)

### 2. Position Preservation
```javascript
Design Studio Position → Cart Display Position
      (x: 300, y: 300) → (x: 30px, y: 30px)  [scaled by 0.1]
```

### 3. Transform Preservation
```javascript
Studio Transform → Cart Transform
  scale: 1.5    →   scale: 1.2  [multiplied by 0.8]
  rotation: 45° →   rotation: 45° [unchanged]
```

## API Integration Points

### 1. HuggingFace API
- **Endpoint**: `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large`
- **Authentication**: Bearer token in `server/.env`
- **Purpose**: Generate AI designs from text prompts

### 2. Design Service Endpoints
- `POST /generate` - Generate new design
- `POST /remove-background` - Remove background from design
- `POST /color-transparency` - Apply color effects
- `GET /designs/history` - Load previous designs
- `POST /designs/save` - Save design to history

### 3. Cart Context
- React Context API for state management
- Actions: ADD_TO_CART, REMOVE_FROM_CART, UPDATE_QUANTITY
- Persists cart state across page navigation

## Security Considerations

### API Token Protection
- ✅ Token stored in `.env` file (not committed)
- ✅ Server-side API calls only
- ✅ Token never exposed to client

### Image Handling
- ✅ Base64 encoding for secure transfer
- ✅ Server-side validation
- ✅ Safe image processing

## Performance Optimizations

1. **Lazy Loading**: Heavy libraries loaded on demand
2. **Image Caching**: Designs cached in browser
3. **Async Operations**: Non-blocking API calls
4. **Optimized Builds**: Tree-shaking and minification

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Design

The application works seamlessly across devices:
- 📱 Mobile (320px - 767px)
- 📱 Tablet (768px - 1023px)
- 💻 Desktop (1024px+)
