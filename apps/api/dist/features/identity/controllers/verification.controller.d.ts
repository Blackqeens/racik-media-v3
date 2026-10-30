import { VerificationService } from '../services/verification.service';
import { SubmitVerificationDto } from '../dto/submit-verification.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
export declare class VerificationController {
    private readonly verificationService;
    constructor(verificationService: VerificationService);
    submitVerification(req: {
        user: {
            id: string;
        };
    }, dto: SubmitVerificationDto): Promise<ApiResponse<any>>;
    getMyVerification(req: {
        user: {
            id: string;
        };
    }): Promise<ApiResponse<{
        id: any;
        verification_type: any;
        status: any;
        submitted_at: any;
        reviewed_at: any;
    } | null>>;
}
