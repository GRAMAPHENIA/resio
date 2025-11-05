import { NextRequest, NextResponse } from 'next/server';
import { Container } from '@/infrastructure/container/Container';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const container = Container.getInstance();
    const bookingService = container.getBookingService();
    
    const result = await bookingService.getBooking({ bookingId: id });

    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: result.booking.id,
          propertyId: result.booking.propertyId,
          contactInfo: {
            name: result.booking.contactInfo.name,
            email: result.booking.contactInfo.getEmailAddress(),
            phone: result.booking.contactInfo.phone
          },
          dateRange: {
            startDate: result.booking.dateRange.toISOStrings().startDate,
            endDate: result.booking.dateRange.toISOStrings().endDate,
            nights: result.booking.getNights(),
            formatted: result.booking.dateRange.getFormattedRange()
          },
          amount: result.booking.amount,
          status: {
            value: result.booking.status.toString(),
            display: result.booking.status.getDisplayName(),
            color: result.booking.status.getColor()
          },
          paymentId: result.booking.paymentId,
          bookingCode: result.booking.getBookingCode(),
          canCancel: result.booking.canBeCancelled(),
          canCompletePayment: result.booking.canCompletePayment(),
          createdAt: result.booking.createdAt?.toISOString()
        },
        property: {
          id: result.property.id,
          name: result.property.name,
          description: result.property.description,
          location: result.property.location,
          pricePerNight: result.property.pricePerNight,
          images: result.property.images,
          bedrooms: result.property.bedrooms,
          bathrooms: result.property.bathrooms,
          area: result.property.area
        }
      }
    });

  } catch (error) {
    console.error('Error getting booking:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { 
      status: error instanceof Error && error.message === 'Booking not found' ? 404 : 400 
    });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const container = Container.getInstance();
    const bookingService = container.getBookingService();
    
    if (body.action === 'complete_payment') {
      const result = await bookingService.completePayment({
        bookingId: id,
        paymentId: body.payment_id
      });

      return NextResponse.json({
        success: true,
        data: {
          booking: {
            id: result.booking.id,
            status: {
              value: result.booking.status.toString(),
              display: result.booking.status.getDisplayName(),
              color: result.booking.status.getColor()
            },
            paymentId: result.booking.paymentId
          }
        }
      });
    }

    if (body.action === 'cancel') {
      const result = await bookingService.cancelBooking({
        bookingId: id,
        reason: body.reason
      });

      return NextResponse.json({
        success: true,
        data: {
          booking: {
            id: result.booking.id,
            status: {
              value: result.booking.status.toString(),
              display: result.booking.status.getDisplayName(),
              color: result.booking.status.getColor()
            }
          },
          refundAmount: result.refundAmount
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Error updating booking:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { 
      status: 400 
    });
  }
}