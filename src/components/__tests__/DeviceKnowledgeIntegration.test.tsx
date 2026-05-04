import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PHONES } from '../../data/devices'
import AccessoryImageSlot from '../AccessoryImageSlot'
import DeviceImage from '../DeviceImage'
import { DeviceDetail } from '../DeviceLookup'
import { PRODUCT_IMAGE_FALLBACK } from '../../utils/manufacturerBadges'

describe('device knowledge integration', () => {
  it('falls back from a local image to the knowledge hero image before the generic placeholder', async () => {
    render(
      <DeviceImage
        device={{
          name: 'iPhone 17',
          imageUrl: '/images/devices/iphone-17.png',
          heroImageUrl: 'https://cdn.example.com/iphone-17-hero.png',
        }}
      />
    )

    const image = screen.getByRole('img', { name: 'iPhone 17' })
    expect(image).toHaveAttribute('src', '/images/devices/iphone-17.png')

    fireEvent.error(image)
    await waitFor(() => {
      expect(image).toHaveAttribute('src', 'https://cdn.example.com/iphone-17-hero.png')
    })

    fireEvent.error(image)
    await waitFor(() => {
      expect(image).toHaveAttribute('src', PRODUCT_IMAGE_FALLBACK)
    })
  })

  it('does not use accessory CDN images as device hero fallbacks', async () => {
    render(
      <DeviceImage
        device={{
          name: 'iPhone 17',
          imageUrl: '/images/devices/iphone-17.png',
          heroImageUrl: 'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/195949371196/195949371196-thumbnail.png',
        }}
      />
    )

    const image = screen.getByRole('img', { name: 'iPhone 17' })
    expect(image).toHaveAttribute('src', '/images/devices/iphone-17.png')

    fireEvent.error(image)
    await waitFor(() => {
      expect(image).toHaveAttribute('src', PRODUCT_IMAGE_FALLBACK)
    })
  })

  it('renders the device detail reference lane with the enriched source link', () => {
    const device = PHONES.find((entry) => entry.name === 'iPhone 17')
    expect(device).toBeTruthy()

    render(<DeviceDetail device={device!} weeklyData={null} ecosystemMatrix={null} />)

    expect(screen.getByText('Source + Reference')).toBeInTheDocument()
    expect(screen.getByText('T-Mobile Detail')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /t-mobile source/i })).toHaveAttribute(
      'href',
      'https://www.t-mobile.com/cell-phone/apple-iphone-17'
    )
  })

  it('falls back from a local accessory image to the knowledge hero image before the manufacturer badge', async () => {
    render(
      <AccessoryImageSlot
        name="Tech21 EvoLite w/ MagSafe"
        imageUrl="/images/accessories/tech21-evolite-w-magsafe.png"
        heroImageUrl="https://cdn.example.com/accessory-hero.png"
        className="h-20 w-20"
        imageClassName="h-full w-full object-contain"
      />
    )

    const image = screen.getByRole('img', { name: 'Tech21 EvoLite w/ MagSafe' })
    expect(image).toHaveAttribute('src', '/images/accessories/tech21-evolite-w-magsafe.png')

    fireEvent.error(image)
    await waitFor(() => {
      expect(image).toHaveAttribute('src', 'https://cdn.example.com/accessory-hero.png')
    })

    fireEvent.error(image)
    await waitFor(() => {
      expect(image.getAttribute('src')).not.toBe('https://cdn.example.com/accessory-hero.png')
      expect(image.getAttribute('src')).not.toBe(PRODUCT_IMAGE_FALLBACK)
    })
  })
})
