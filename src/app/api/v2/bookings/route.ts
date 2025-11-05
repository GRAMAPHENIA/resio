import { NextRequest, NextResponse } from 'next/server';
import { Container } from '@/infrastructure/container/Container';
import { CreateBookingRequest } from '@/application/booking/CreateBookingUseCase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const createBookingRequest: CreateBookingRequest = {
      propertyId: body.property_id,
      contactInfo: {
        name: body.user_name,
        email: body.user_email,
        phone: body.user_phone
      },
      dateRange: {
        startDate: body.start_date,
        endDate: body.end_date
      },
      userId: body.user_id
    };

    const container = Container.getInstance();
    const bookingService = container.getBookingService();
    
    const result = await bookingService.createBooking(createBookingRequest);

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
            nights: result.booking.getNights()
          },
          amount: result.booking.amount,
          status: result.booking.status.toString(),
          bookingCode: result.booking.getBookingCode(),
          createdAt: result.booking.createdAt?.toISOString()
        },
        property: {
          id: result.property.id,
          name: result.property.name,
          location: result.property.location,
          pricePerNight: result.property.pricePerNight
        }
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { 
      status: 400 
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    if (!email && !userId) {
      return NextResponse.json({
        success: false,
        error: 'Either email or userId is required'
      }, { status: 400 });
    }

    const container = Container.getInstance();
    const bookingService = container.getBookingService();
    
    const result = await bookingService.getUserBookings({ email: email || undefined, userId: userId || undefined });

    const bookingsData = result.bookings.map(booking => ({
      id: booking.id,
      propertyId: booking.propertyId,
      contactInfo: {
        name: booking.contactInfo.name,
        email: booking.contactInfo.getEmailAddress(),
        phone: booking.contactInfo.phone
      },
      dateRange: {
        startDate: booking.dateRange.toISOStrings().startDate,
        endDate: booking.dateRange.toISOStrings().endDate,
        nights: booking.getNights(),
        formatted: booking.dateRange.getFormattedRange()
      },
      amount: booking.amount,
      status: {
        value: booking.status.toString(),
        display: booking.status.getDisplayName(),
        color: booking.status.getColor()
      },
      bookingCode: booking.getBookingCode(),
      canCancel: booking.canBeCancelled(),
      canCompletePayment: booking.canCompletePayment(),
      createdAt: booking.createdAt?.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: {
        bookings: bookingsData
      }
    });

  } catch (error) {
    console.error('Error getting bookings:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { 
      status: 400 
    });
  }
}