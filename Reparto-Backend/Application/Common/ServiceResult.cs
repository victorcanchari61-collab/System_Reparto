namespace Reparto_Backend.Application.Common;

/// <summary>Resultado de una operación de servicio que devuelve un valor.</summary>
public sealed record ServiceResult<T>
{
    public T?     Value    { get; private init; }
    public string? Error   { get; private init; }
    public bool    IsSuccess => Error is null;

    public static ServiceResult<T> Success(T value) => new() { Value = value };
    public static ServiceResult<T> Failure(string error) => new() { Error = error };
}

/// <summary>Resultado de una operación de servicio sin valor de retorno.</summary>
public sealed record ServiceResult
{
    public string? Error    { get; private init; }
    public bool    IsSuccess => Error is null;

    public static ServiceResult Success()              => new();
    public static ServiceResult Failure(string error)  => new() { Error = error };
}
