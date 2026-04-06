import axios from 'axios';

/**
 * TrueMoney Voucher/Red Envelope Redeem API
 * Based on: https://github.com/manybaht/Manybaht-Truewallet-API
 *
 * Redeems a TrueMoney gift voucher (อั่งเปา) link
 * and deposits the money to the specified phone number.
 */

/**
 * @param {string} phoneNumber - Phone number to receive the money (e.g. '0901234567')
 * @param {string} voucherCode - The voucher code or full gift link
 * @returns {Promise<{status: string, amount?: number, reason?: string}>}
 */
export async function redeemVoucher(phoneNumber, voucherCode) {
  // Extract voucher hash from full URL if provided
  voucherCode = voucherCode.replace('https://gift.truemoney.com/campaign/?v=', '');

  // Validate voucher code
  if (!voucherCode || voucherCode.length <= 0) {
    return {
      status: 'FAIL',
      reason: 'กรุณากรอกลิงก์อั่งเปา',
    };
  }

  if (!/^[a-z0-9]*$/i.test(voucherCode)) {
    return {
      status: 'FAIL',
      reason: 'ลิงก์อั่งเปาไม่ถูกต้อง (ต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น)',
    };
  }

  try {
    const data = {
      mobile: `${phoneNumber}`,
      voucher_hash: `${voucherCode}`,
    };

    const response = await axios({
      method: 'post',
      url: `https://gift.truemoney.com/campaign/vouchers/${voucherCode}/redeem`,
      data: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });

    const resJson = response.data;

    if (resJson.status && resJson.status.code === 'SUCCESS') {
      return {
        status: 'SUCCESS',
        amount: parseInt(resJson.data.voucher.redeemed_amount_baht),
      };
    } else {
      return {
        status: 'FAIL',
        reason: resJson.status?.message || 'ไม่สามารถรับอั่งเปาได้',
      };
    }
  } catch (err) {
    const errData = err.response?.data;
    if (errData?.status?.message) {
      return {
        status: 'FAIL',
        reason: errData.status.message,
      };
    }
    return {
      status: 'ERROR',
      reason: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่',
    };
  }
}
