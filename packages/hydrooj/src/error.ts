/* eslint-disable max-len */
/* eslint-disable func-names */
import { isClass } from './utils';

interface IHydroError {
    new(...args: any[]): HydroError
}

function isHydroError(item: any): item is IHydroError {
    return isClass(item);
}

const Err = (name: string, ...info: Array<IHydroError | (() => string) | string | number>) => {
    let Class: IHydroError;
    let msg: () => string;
    let code: number;
    for (const item of info) {
        if (typeof item === 'number') {
            code = item;
        } else if (typeof item === 'string') {
            msg = function () { return item; };
        } else if (isHydroError(item)) {
            Class = item;
        } else if (typeof item === 'function') {
            msg = item;
        }
    }
    const HydroError = class extends Class { };
    HydroError.prototype.name = name;
    if (msg) HydroError.prototype.msg = msg;
    if (code) HydroError.prototype.code = code;
    return HydroError;
};

export class HydroError extends Error {
    params: any[];

    code: number;

    constructor(...params: any[]) {
        super();
        this.params = params;
    }

    // eslint-disable-next-line class-methods-use-this
    msg() {
        return 'HydroError';
    }
}

export const UserFacingError = Err('UserFacingError', HydroError, 'UserFacingError', 400);
export const SystemError = Err('SystemError', HydroError, 'SystemError', 500);

export const BadRequestError = Err('BadRequestError', UserFacingError, 'BadRequestError', 400);
export const ForbiddenError = Err('ForbiddenError', UserFacingError, 'ForbiddenError', 403);
export const NotFoundError = Err('NotFoundError', UserFacingError, 'NotFoundError', 404);
export const MethodNotAllowedError = Err('MethodNotAllowedError', UserFacingError, 'MethodNotAllowedError', 405);
export const RemoteOnlineJudgeError = Err('RemoteOnlineJudgeError', UserFacingError, 'RemoteOnlineJudgeError', 500);
export const SendMailError = Err('SendMailError', UserFacingError, 'Failed to send mail to {0}.', 500);

export const AlreadyVotedError = Err('AlreadyVotedError', ForbiddenError, "You've already voted.");
export const LoginError = Err('LoginError', ForbiddenError, 'Invalid password for user {0}.');
export const UserAlreadyExistError = Err('UserAlreadyExistError', ForbiddenError, 'User {0} already exists.');
export const InvalidTokenError = Err('InvalidTokenError', ForbiddenError);
export const BlacklistedError = Err('BlacklistedError', ForbiddenError, 'Address or user {0} is blacklisted.');
export const VerifyPasswordError = Err('VerifyPasswordError', ForbiddenError, "Passwords don't match.");
export const OpcountExceededError = Err('OpcountExceededError', ForbiddenError, 'Too frequent operations of {0} (limit: {2} operations in {1} seconds).');
export const PermissionError = Err('PermissionError', ForbiddenError, "You don't have the required permission ({0}) in this domain.");
export const PrivilegeError = Err('PrivilegeError', ForbiddenError, function () {
    if (this.params.includes(global.Hydro.model.builtin.PRIV.PRIV_USER_PROFILE)) {
        return "You're not logged in.";
    }
    return "You don't have the required privilege.";
});
export const ValidationError = Err('ValidationError', ForbiddenError, function () {
    if (this.params.length === 1) return 'Field {0} validation failed.';
    return 'Field {0} or {1} validation failed.';
});
export const ContestNotAttendedError = Err('ContestNotAttendedError', ForbiddenError, "You haven't attended this contest yet.");
export const ContestAlreadyAttendedError = Err('ContestAlreadyAttendedError', ForbiddenError, "You've already attended this contest.");
export const ContestNotLiveError = Err('ContestNotLiveError', ForbiddenError, 'This contest is not live.');
export const ContestScoreboardHiddenError = Err('ContestScoreboardHiddenError', ForbiddenError, 'Contest scoreboard is not visible.');
export const TrainingAlreadyEnrollError = Err('TrainingAlreadyEnrollError', ForbiddenError, "You've already enrolled this training.");
export const HomeworkNotLiveError = Err('HomeworkNotLiveError', ForbiddenError, 'This homework is not open.');
export const HomeworkNotAttendedError = Err('HomeworkNotAttendedError', ForbiddenError, "You haven't claimed this homework yet.");
export const RoleAlreadyExistError = Err('RoleAlreadyExistError', ForbiddenError, 'This role already exists.');
export const CsrfTokenError = Err('CsrfTokenError', ForbiddenError, 'CsrfTokenError');
export const DomainJoinForbiddenError = Err('DomainJoinForbiddenError', ForbiddenError, 'You are not allowed to join the domain. The link is either invalid or expired.');
export const DomainJoinAlreadyMemberError = Err('DomainJoinAlreadyMemberError', ForbiddenError, 'Failed to join the domain. You are already a member.');
export const InvalidJoinInvitationCodeError = Err('InvalidJoinInvitationCodeError', ForbiddenError, 'The invitation code you provided is invalid.');

export const UserNotFoundError = Err('UserNotFoundError', NotFoundError, 'User {0} not found.');
export const NoProblemError = Err('NoProblemError', NotFoundError, 'No problem.');
export const RecordNotFoundError = Err('RecordNotFoundError', NotFoundError, 'Record {0} not found.');
export const ProblemDataNotFoundError = Err('ProblemDataNotFoundError', NotFoundError, 'Data of problem {0} not found.');
export const MessageNotFoundError = Err('MessageNotFoundError', NotFoundError, 'Message {0} not found.');
export const DocumentNotFoundError = Err('DocumentNotFoundError', NotFoundError, 'Document {2} not found.');

export const ProblemNotFoundError = Err('ProblemNotFountError', DocumentNotFoundError, 'Problem {0} not found.');
export const SolutionNotFoundError = Err('SolutionNotFoundError', DocumentNotFoundError, 'Solution {0} not found.');
export const TrainingNotFoundError = Err('TrainingNotFoundError', DocumentNotFoundError, 'Training {0} not found.');
export const ContestNotFoundError = Err('ContestNotFoundError', DocumentNotFoundError, 'Contest {0} not found.');
export const DiscussionNotFoundError = Err('DiscussionNotFoundError', DocumentNotFoundError, 'Discussion {0} not found.');
export const DiscussionNodeNotFoundError = Err('DiscussionNodeNotFoundError', DocumentNotFoundError, 'Discussion node {1} not found.');

export const InvalidOperationError = Err('InvalidOperationError', MethodNotAllowedError);

global.Hydro.error = {
    HydroError,
    BadRequestError,
    BlacklistedError,
    ForbiddenError,
    NotFoundError,
    SendMailError,
    LoginError,
    CsrfTokenError,
    MethodNotAllowedError,
    InvalidOperationError,
    UserAlreadyExistError,
    InvalidTokenError,
    UserNotFoundError,
    VerifyPasswordError,
    ProblemDataNotFoundError,
    OpcountExceededError,
    PermissionError,
    PrivilegeError,
    NoProblemError,
    ValidationError,
    ProblemNotFoundError,
    TrainingNotFoundError,
    ContestNotFoundError,
    RecordNotFoundError,
    SolutionNotFoundError,
    AlreadyVotedError,
    ContestNotAttendedError,
    ContestNotLiveError,
    ContestScoreboardHiddenError,
    ContestAlreadyAttendedError,
    DomainJoinAlreadyMemberError,
    DomainJoinForbiddenError,
    InvalidJoinInvitationCodeError,
    UserFacingError,
    SystemError,
    TrainingAlreadyEnrollError,
    HomeworkNotLiveError,
    HomeworkNotAttendedError,
    RemoteOnlineJudgeError,
    DiscussionNodeNotFoundError,
    DocumentNotFoundError,
    DiscussionNotFoundError,
    RoleAlreadyExistError,
    MessageNotFoundError,
};

/*
class FileTooLongError(ValidationError):
  @property
  def message(self):
    return 'The uploaded file is too long.'

class FileTypeNotAllowedError(ValidationError):
  @property
  def message(self):
    return 'This type of files are not allowed to be uploaded.'

class InvalidTokenDigestError(ForbiddenError):
  pass

class CurrentPasswordError(ForbiddenError):
  @property
  def message(self):
    return "Current password doesn't match."

class DiscussionCategoryAlreadyExistError(ForbiddenError):
  @property
  def message(self):
    return 'Discussion category {1} already exists.'

class DiscussionCategoryNotFoundError(NotFoundError):
  @property
  def message(self):
    return 'Discussion category {1} not found.'

class DiscussionNodeAlreadyExistError(ForbiddenError):
  @property
  def message(self):
    return 'Discussion node {1} already exists.'

class TrainingRequirementNotSatisfiedError(ForbiddenError):
  @property
  def message(self):
    return 'Training requirement is not satisfied.'

class UsageExceededError(ForbiddenError):
  @property
  def message(self):
    return 'Usage exceeded.'

class InvalidArgumentError(BadRequestError):
  @property
  def message(self):
    return 'Argument {0} is invalid.'
*/
