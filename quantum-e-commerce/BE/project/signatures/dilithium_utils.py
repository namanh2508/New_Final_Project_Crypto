# signatures/dilithium_utils.py

import oqs
import base64

class DilithiumSignature:
    # Sử dụng biến thể Dilithium3 mặc định
    VARIANT_CLASS = oqs.Signature  # Sử dụng class chung
    VARIANT_NAME = "Dilithium3"     # Tên thuật toán dưới dạng string

    @staticmethod
    def generate_keypair():
        """
        Tạo cặp khóa Dilithium bằng thư viện OQS, sử dụng API đúng.
        """
        # Khởi tạo đối tượng signature với tên thuật toán
        with DilithiumSignature.VARIANT_CLASS(DilithiumSignature.VARIANT_NAME) as signer:
            public_key = signer.generate_keypair()
            secret_key = signer.export_secret_key()
            
            public_key_b64 = base64.b64encode(public_key).decode('utf-8')
            secret_key_b64 = base64.b64encode(secret_key).decode('utf-8')
            
            return secret_key_b64, public_key_b64

    @staticmethod
    def sign(message: bytes, private_key_b64: str) -> str:
        """
        Ký một thông điệp (bytes) bằng khóa bí mật.
        """
        secret_key = base64.b64decode(private_key_b64)
        with DilithiumSignature.VARIANT_CLASS(DilithiumSignature.VARIANT_NAME, secret_key) as signer:
            signature = signer.sign(message)
            return base64.b64encode(signature).decode('utf-8')

    @staticmethod
    def verify(message: bytes, signature_b64: str, public_key_b64: str) -> bool:
        """
        Xác minh chữ ký.
        """
        try:
            public_key = base64.b64decode(public_key_b64)
            signature = base64.b64decode(signature_b64)
            
            with DilithiumSignature.VARIANT_CLASS(DilithiumSignature.VARIANT_NAME) as verifier:
                is_valid = verifier.verify(message, signature, public_key)
                return is_valid
        except Exception:
            return False